import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
} from "domain/transfer/services";
import { toHex } from "lib/utils";
import type { CreateMintProps, MintResources, UserPublicKeys } from "types";
import type { Address } from "viem";
import {
  AuthorityVerifyingKey,
  Digest,
  MerkleTree,
  NullifierKey,
  NullifierKeyCommitment,
  Resource,
  initWasm as initArmWasm,
  initSync as initArmWasmSync,
  randomBytes,
} from "wasm/armRisc0Bindings";

import {
  initWasm as initTransferWasm,
  initSync as initTransferWasmSync,
} from "wasm/anomaPayLib";

import { TransferLogic as WasmTransferLogic } from "wasm/anomaPayLib/anomapay_lib";

/**
 * Transfer client which provies the necessary resource logic for
 * Anoma Simple Transfer Application
 */
export class TransferLogic {
  trivialLogicVerifyingKey = "";

  static async init(
    transferLogicVerifyingKey: string,
    trivialLogicVerifyingKey: string,
    armWasmBytes?: Uint8Array,
    transferWasmBytes?: Uint8Array
  ): Promise<TransferLogic> {
    /** Annoying console messages until this is resolved **/
    /** As of this PR, these should be pulled from the transfer app lib we depend on **/
    console.warn(
      `Why do we require transferLogicVerifyingKey here? Got ${transferLogicVerifyingKey}`
    );
    console.warn(
      `Why do we require trivialLogicVerifyingKey here? Got ${trivialLogicVerifyingKey}`
    );
    const armInstance =
      armWasmBytes ? initArmWasmSync(armWasmBytes) : await initArmWasm();
    const transferInstance =
      transferWasmBytes ?
        initTransferWasmSync(transferWasmBytes)
      : await initTransferWasm();

    if (!armInstance || !transferInstance) {
      throw new Error("Failed to initialize wasm modules");
    }

    const client = new TransferLogic();
    // TODO: Shouldn't have to do this!
    client.trivialLogicVerifyingKey = trivialLogicVerifyingKey;
    return client;
  }

  createPaddingResource(props?: {
    nullifierKey: NullifierKey;
    resource: Resource;
  }): Resource {
    let nonce: Digest;
    if (props) {
      const { resource, nullifierKey } = props;
      nonce = resource.nullifier(nullifierKey);
    } else {
      nonce = Digest.fromBytes(randomBytes());
    }
    return Resource.create(
      Digest.fromHex(this.trivialLogicVerifyingKey),
      Digest.default(),
      0n,
      Digest.default(),
      true,
      nonce,
      NullifierKey.default().commit()
    );
  }

  /** Creates a transfer resource destined for an Anoma address receiver. */
  createTransferResource({
    forwarderAddress,
    nullifierKey,
    quantity,
    receiverPublicKeys,
    resource,
    token,
  }: {
    forwarderAddress: Address;
    nullifierKey: NullifierKey;
    quantity: bigint;
    receiverPublicKeys: UserPublicKeys;
    resource: Resource;
    token: Address;
  }): Resource {
    const logicRef = Digest.fromHex(WasmTransferLogic.verifyingKey);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const nonce = resource.nullifier(nullifierKey);
    const receiverAuthVerifyingKey = new AuthorityVerifyingKey(
      receiverPublicKeys.authorityPublicKey
    );
    const valueRef = calculateValueRefFromAuth(
      receiverAuthVerifyingKey,
      toHex(receiverPublicKeys.encryptionPublicKey)
    );
    return Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      false,
      nonce,
      new NullifierKeyCommitment(receiverPublicKeys.nullifierKeyCommitment)
    );
  }

  /** Creates a burn (unwrap) resource destined for an EVM wallet address. */
  createBurnResource({
    forwarderAddress,
    nullifierKey,
    quantity,
    receiverAddress,
    resource,
    token,
  }: {
    forwarderAddress: Address;
    nullifierKey: NullifierKey;
    quantity: bigint;
    receiverAddress: string;
    resource: Resource;
    token: Address;
  }): Resource {
    const logicRef = Digest.fromHex(WasmTransferLogic.verifyingKey);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const nonce = resource.nullifier(nullifierKey);
    const valueRef = calculateValueRefFromUserAddress(receiverAddress);
    return Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      true,
      nonce,
      nullifierKey.commit()
    );
  }

  /** Creates a consumed/created resource pair for minting tokens into the Anoma shielded pool. */
  createMintResources(props: CreateMintProps): MintResources {
    const { userAddress, forwarderAddress, token, quantity, keyring } = props;

    const nk = new NullifierKey(keyring.nullifierKeyPair.nk);
    const nkCommitment = nk.commit();
    const logicRef = Digest.fromHex(WasmTransferLogic.verifyingKey);
    const labelRef = calculateLabelRef(forwarderAddress, token);

    const consumedResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      calculateValueRefFromUserAddress(userAddress),
      true,
      Digest.fromBytes(randomBytes()),
      nkCommitment
    );

    const consumedResourceNullifier = consumedResource.nullifier(nk);
    if (!consumedResourceNullifier) {
      throw "mint: consumed resource nullifier is undefined";
    }

    const createdResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      calculateValueRefFromAuth(
        new AuthorityVerifyingKey(keyring.authorityKeyPair.publicKey),
        toHex(keyring.encryptionKeyPair.publicKey)
      ),
      false,
      consumedResourceNullifier,
      nkCommitment
    );

    const createdResourceCommitment = createdResource.commitment();
    const actionTree = new MerkleTree([
      consumedResourceNullifier,
      createdResourceCommitment,
    ]);

    return {
      actionTree,
      createdResource,
      consumedResource,
    };
  }
}
