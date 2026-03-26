import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
} from "domain/transfer/services";
import {
  TRANSFER_LOGIC_VERIFYING_KEY,
  TRIVIAL_LOGIC_VERIFYING_KEY,
} from "lib-constants";
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
  static async init(wasmUrl?: string): Promise<TransferLogic> {
    return initClient(TransferLogic, TRANSFER_LOGIC_VERIFYING_KEY, wasmUrl);
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
      Digest.fromHex(TRIVIAL_LOGIC_VERIFYING_KEY),
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
    receiverKeyring,
    resource,
    token,
  }: {
    forwarderAddress: Address;
    nullifierKey: NullifierKey;
    quantity: bigint;
    receiverKeyring: UserPublicKeys;
    resource: Resource;
    token: Address;
  }): Resource {
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const nonce = resource.nullifier(nullifierKey);
    const receiverAuthVerifyingKey = new AuthorityVerifyingKey(
      receiverKeyring.authorityPublicKey
    );
    const valueRef = calculateValueRefFromAuth(
      receiverAuthVerifyingKey,
      toHex(receiverKeyring.encryptionPublicKey)
    );
    return Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      false,
      nonce,
      new NullifierKeyCommitment(receiverKeyring.nullifierKeyCommitment)
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
