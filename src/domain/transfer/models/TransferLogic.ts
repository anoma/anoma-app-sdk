import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
  checkConstructSplit,
} from "domain/transfer/services";
import {
  TRANSFER_LOGIC_VERIFYING_KEY,
  TRIVIAL_LOGIC_VERIFYING_KEY,
} from "lib-constants";
import { toHex } from "lib/utils";
import type {
  CreateMintProps,
  CreateTransferProps,
  CreatedResources,
  MintResources,
  UserPublicKeys,
} from "types";
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
  static async init(): Promise<TransferLogic> {
    return initClient(TransferLogic, TRANSFER_LOGIC_VERIFYING_KEY);
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

  // TODO merge createTransferResource2 and createBurnResource2

  /** Creates a transfer resource destined for an Anoma address receiver. */
  createTransferResource2({
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

  /** Creates an ephemeral consumed resource representing a deposit from an EVM wallet. */
  createEphemeralConsumedResource({
    forwarderAddress,
    nullifierKey,
    quantity,
    userAddress,
    tokenAddress,
  }: {
    forwarderAddress: Address;
    nullifierKey: NullifierKey;
    quantity: bigint;
    userAddress: Address;
    tokenAddress: Address;
  }): Resource {
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, tokenAddress);
    return Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      calculateValueRefFromUserAddress(userAddress),
      true,
      Digest.fromBytes(randomBytes()),
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

  /** Creates a transfer resource with automatic split handling when resource quantity exceeds target. */
  createTransferResource(props: CreateTransferProps): CreatedResources {
    const {
      forwarderAddress,
      quantity,
      token,
      resource,
      nullifierKey,
      receiverKeyring,
    } = props;

    const receiverAuthVerifyingKey = new AuthorityVerifyingKey(
      receiverKeyring.authorityPublicKey
    );

    const transferredResourceNullifier = resource.nullifier(nullifierKey);
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const createdValueRef = calculateValueRefFromAuth(
      receiverAuthVerifyingKey,
      toHex(receiverKeyring.encryptionPublicKey)
    );
    const createdResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      createdValueRef,
      false,
      transferredResourceNullifier,
      new NullifierKeyCommitment(receiverKeyring.nullifierKeyCommitment)
    );
    const createdResourceCommitment = createdResource.commitment();

    const actions: string[] = [
      transferredResourceNullifier.toHex(),
      createdResourceCommitment.toHex(),
    ];

    const {
      paddingResource,
      remainderResource,
      splitActions = [],
    } = checkConstructSplit(resource, quantity);

    return {
      actions: [...actions, ...splitActions],
      createdResource,
      consumedResource: resource,
      paddingResource,
      remainderResource,
    };
  }
}
