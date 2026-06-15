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
  randomBytes,
} from "wasm";

import { Client, initClient } from "wasm/client";

/**
 * Transfer client which provies the necessary resource logic for
 * Anoma Simple Transfer Application
 */
export class TransferLogic extends Client {
  trivialLogicVerifyingKey = "";

  static async init(
    transferLogicVerifyingKey: string,
    trivialLogicVerifyingKey: string,
    wasmBytes?: Uint8Array
  ): Promise<TransferLogic> {
    const client = await initClient(
      TransferLogic,
      transferLogicVerifyingKey,
      wasmBytes
    );
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
    const logicRef = Digest.fromHex(this.digest);
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
    const logicRef = Digest.fromHex(this.digest);
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
    const logicRef = Digest.fromHex(this.digest);
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
