import {
  ActionTree,
  AuthorityVerifyingKey,
  deriveNonceFromNullifiers,
  Digest,
  NullifierKey,
  NullifierKeyCommitment,
  randomBytes,
  Resource,
} from "@anomaorg/arm-bindings";
import { toHex } from "primitives";
import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
} from "transfer/services";
import type { CreateMintProps, MintResources, UserPublicKeys } from "types";
import type { Address } from "viem";
import { Client, initClient } from "./client";

/**
 * Transfer client which provies the necessary resource logic for
 * Anoma Simple Transfer Application
 */
export class TransferLogic extends Client {
  static async init(
    transferLogicVerifyingKey: string,
    wasmBytes?: Uint8Array
  ): Promise<TransferLogic> {
    return initClient(TransferLogic, transferLogicVerifyingKey, wasmBytes);
  }

  /**
   * Creates a transfer resource destined for an Anoma address receiver. Its
   * nonce is a placeholder until `PayloadBuilder` derives it from the
   * transaction's consumed nullifiers.
   */
  createTransferResource({
    forwarderAddress,
    quantity,
    receiverPublicKeys,
    token,
  }: {
    forwarderAddress: Address;
    quantity: bigint;
    receiverPublicKeys: UserPublicKeys;
    token: Address;
  }): Resource {
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
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
      Digest.zero(),
      new NullifierKeyCommitment(receiverPublicKeys.nullifierKeyCommitment)
    );
  }

  /**
   * Creates a burn (unwrap) resource destined for an EVM wallet address. Its
   * nonce is a placeholder until `PayloadBuilder` derives it.
   */
  createBurnResource({
    forwarderAddress,
    nullifierKey,
    quantity,
    receiverAddress,
    token,
  }: {
    forwarderAddress: Address;
    nullifierKey: NullifierKey;
    quantity: bigint;
    receiverAddress: string;
    token: Address;
  }): Resource {
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const valueRef = calculateValueRefFromUserAddress(receiverAddress);
    return Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      true,
      Digest.zero(),
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
      deriveNonceFromNullifiers(0, [consumedResourceNullifier]),
      nkCommitment
    );

    const createdResourceCommitment = createdResource.commitment();
    const actionTree = new ActionTree([
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
