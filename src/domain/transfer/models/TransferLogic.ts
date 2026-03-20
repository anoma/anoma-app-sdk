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
 * Core resource-building logic for the Anoma Simple Transfer Application.
 *
 * `TransferLogic` wraps the WASM `arm-bindings` module and exposes high-level
 * methods that construct the Resource Machine objects required for each
 * operation type (mint, transfer, burn, fee-transfer).
 *
 * Always instantiate via the async {@link TransferLogic.init} factory so the
 * WASM module is loaded before any resource methods are called.
 *
 * @example
 * ```typescript
 * const logic = await TransferLogic.init();
 * const mintResources = logic.createMintResources({ ... });
 * ```
 */
export class TransferLogic extends Client {
  /**
   * Asynchronous factory that loads the WASM module and returns a ready-to-use
   * `TransferLogic` instance.
   *
   * Must be called before invoking any other method on this class.
   *
   * @returns A fully-initialized {@link TransferLogic} instance.
   *
   * @example
   * ```typescript
   * const logic = await TransferLogic.init();
   * ```
   */
  static async init(): Promise<TransferLogic> {
    return initClient(TransferLogic, TRANSFER_LOGIC_VERIFYING_KEY);
  }

  /**
   * Creates a zero-value ephemeral padding resource used to satisfy the
   * protocol's balanced-action rule during split transactions.
   *
   * When `props` are provided, the padding resource's nonce is derived from
   * the nullifier of the given resource; otherwise a random nonce is used.
   *
   * @param props - Optional `{ resource, nullifierKey }` to derive a deterministic nonce.
   * @returns A trivial-logic ephemeral {@link Resource} with zero quantity.
   */
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

  /**
   * Creates a transfer resource destined for an Anoma Pay address receiver.
   *
   * Lower-level alternative to {@link createTransferResource} that accepts
   * individual parameters directly instead of a `CreateTransferProps` object.
   *
   * @param params.forwarderAddress - The forwarder contract address.
   * @param params.nullifierKey - The sender's nullifier key.
   * @param params.quantity - Amount to transfer.
   * @param params.receiverKeyring - The receiver's public keys.
   * @param params.resource - The source resource to consume.
   * @param params.token - ERC-20 token contract address.
   * @returns The newly created {@link Resource} for the receiver.
   */
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

  /**
   * Creates a burn (unwrap) resource destined for an EVM wallet address.
   *
   * Lower-level alternative that accepts individual parameters directly.
   *
   * @param params.forwarderAddress - The forwarder contract address.
   * @param params.nullifierKey - The sender's nullifier key.
   * @param params.quantity - Amount to withdraw.
   * @param params.receiverAddress - EVM address that will receive the tokens.
   * @param params.resource - The source resource to consume.
   * @param params.token - ERC-20 token contract address.
   * @returns The newly created ephemeral {@link Resource} encoding the withdrawal.
   */
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

  /**
   * Creates an ephemeral consumed resource representing a deposit from an EVM wallet.
   *
   * Used internally during the mint flow to produce the consumed side of the
   * resource pair that gets authorized by Permit2.
   *
   * @param params.forwarderAddress - The forwarder contract address.
   * @param params.nullifierKey - The depositor's nullifier key.
   * @param params.quantity - Amount being deposited.
   * @param params.userAddress - The depositor's EVM wallet address.
   * @param params.tokenAddress - ERC-20 token contract address.
   * @returns An ephemeral {@link Resource} encoding the deposit intent.
   */
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

  /**
   * Builds the pair of resources needed to deposit an ERC-20 token into the
   * privacy protocol (mint operation).
   *
   * The **consumed** resource is ephemeral and represents the ERC-20 tokens
   * being wrapped; its nullifier seeds the **created** resource. The **created**
   * resource is the private in-protocol balance credited to the caller.
   *
   * @param props - Mint parameters including the recipient address, forwarder,
   *   token contract address, quantity (as `bigint`), and the caller's keyring.
   * @returns {@link MintResources} containing `actionTree`, `consumedResource`,
   *   and `createdResource`.
   * @throws If the consumed resource nullifier cannot be computed.
   *
   * @example
   * ```typescript
   * const { actionTree, consumedResource, createdResource } =
   *   logic.createMintResources({
   *     userAddress: "0xAbc...",
   *     forwarderAddress: "0xDef...",
   *     token: "0x123...",
   *     quantity: 1_000_000n,
   *     keyring,
   *   });
   * ```
   */
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

  /**
   * Builds the resources for a private peer-to-peer transfer.
   *
   * The caller's existing resource is consumed (nullified) and a new resource
   * of the same logic/label is created and addressed to the receiver's public
   * keys. If the consumed resource has a quantity greater than `props.quantity`,
   * a split is automatically computed and the remainder and padding resources
   * are included in the returned `CreatedResources`.
   *
   * @param props - Transfer parameters including the source `resource`, forwarder
   *   address, token address, `quantity` to send, the sender's `nullifierKey`,
   *   and the receiver's `receiverKeyring` (public keys only).
   * @returns {@link CreatedResources} with `actions`, `consumedResource`,
   *   `createdResource`, and optionally `paddingResource` / `remainderResource`.
   *
   * @example
   * ```typescript
   * const result = logic.createTransferResource({
   *   resource: myResource,
   *   forwarderAddress: "0xDef...",
   *   token: "0x123...",
   *   quantity: 500_000n,
   *   nullifierKey: new NullifierKey(keyring.nullifierKeyPair.nk),
   *   receiverKeyring: receiverPublicKeys,
   * });
   * ```
   */
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

  /**
   * Builds the resources for paying a protocol fee to Heliax.
   *
   * The caller's resource is consumed and a new resource is created using the
   * Heliax fee logic ref and the well-known Heliax fee nullifier key commitment.
   * Split resources are included when the consumed resource is larger than
   * `quantity`.
   *
   * @param props - Fee transfer parameters: the source `resource`,
   *   `tokenContractAddress`, `forwarderAddress`, `quantity`, and the
   *   caller's `keyring`.
   * @returns {@link CreatedResources} with `actions`, `consumedResource`,
   *   `createdResource`, and optionally split resources.
   *
   * @example
   * ```typescript
   * const feeResult = logic.createFeeTransferResource({
   *   resource: myResource,
   *   tokenContractAddress: "0x123...",
   *   forwarderAddress: "0xDef...",
   *   quantity: 500n,
   *   keyring,
   * });
   * ```
   */
  createFeeTransferResource({
    resource,
    tokenContractAddress,
    forwarderAddress,
    quantity,
    keyring,
  }: import("types").CreateFeeTransferProps): CreatedResources {
    const transferredResourceNullifier = resource.nullifier(
      new NullifierKey(keyring.nullifierKeyPair.nk)
    );
    const labelRef = calculateLabelRef(forwarderAddress, tokenContractAddress);

    const createdResource = Resource.create(
      Digest.fromHex(this.digest),
      labelRef,
      BigInt(quantity),
      calculateValueRefFromAuth(
        new AuthorityVerifyingKey(keyring.authorityKeyPair.publicKey),
        toHex(keyring.encryptionKeyPair.publicKey)
      ),
      false,
      transferredResourceNullifier,
      NullifierKey.default().commit()
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
