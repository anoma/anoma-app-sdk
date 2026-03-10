import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
  checkConstructSplit,
  tokenSymbolToLabelRef,
} from "domain/transfer/services";
import { TRANSFER_LOGIC_VERIFYING_KEY } from "lib-constants";
import { toHex } from "lib/utils";
import type {
  CreateBurnProps,
  CreateFeeTransferProps,
  CreateMintProps,
  CreateTransferProps,
  CreatedResources,
  MintResources,
} from "types";
import {
  AuthorityVerifyingKey,
  Digest,
  HeliaxKeys,
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
   *   address, token address, `quantity` to send, the sender's full `keyring`,
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
   *   keyring: senderKeyring,
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
      keyring,
      receiverKeyring,
    } = props;
    const receiverAuthVerifyingKey = new AuthorityVerifyingKey(
      receiverKeyring.authorityPublicKey
    );

    const nullifierKey = new NullifierKey(keyring.nullifierKeyPair.nk);
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

    const actions: Digest[] = [
      transferredResourceNullifier,
      createdResourceCommitment,
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
   * Builds the resources needed to withdraw tokens from the privacy protocol
   * back to an ERC-20 address (burn operation).
   *
   * The private `burnResource` is consumed and an ephemeral resource is created
   * that encodes the `burnAddress` as its value reference, signalling to the
   * protocol that the underlying ERC-20 tokens should be released to that address.
   * If the consumed resource is larger than `quantity`, split resources are included.
   *
   * @param props - Burn parameters including `burnResource` (the resource to spend),
   *   `burnAddress` (EVM address that receives the ERC-20), forwarder address,
   *   token address, `quantity` (as `bigint`), and the caller's `keyring`.
   * @returns {@link CreatedResources} with `actions`, `consumedResource`,
   *   `createdResource`, and optionally `paddingResource` / `remainderResource`.
   *
   * @example
   * ```typescript
   * const result = logic.createBurnResource({
   *   burnResource: myResource,
   *   burnAddress: "0xAbc...",
   *   forwarderAddress: "0xDef...",
   *   token: "0x123...",
   *   quantity: 1_000_000n,
   *   keyring,
   * });
   * ```
   */
  createBurnResource(props: CreateBurnProps): CreatedResources {
    const {
      burnResource,
      burnAddress,
      forwarderAddress,
      token,
      quantity,
      keyring,
    } = props;

    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const valueRef = calculateValueRefFromUserAddress(burnAddress);
    const burnNk = new NullifierKey(keyring.nullifierKeyPair.nk);
    const burnResourceNullifier = burnResource.nullifier(burnNk);

    const createdResource = Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      true,
      burnResourceNullifier,
      burnNk.commit()
    );
    const createdResourceCommitment = createdResource.commitment();

    const actions: Digest[] = [
      burnResourceNullifier,
      createdResourceCommitment,
    ];

    const {
      paddingResource,
      remainderResource,
      splitActions = [],
    } = checkConstructSplit(burnResource, quantity);

    return {
      actions: [...actions, ...splitActions],
      createdResource,
      consumedResource: burnResource,
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
   * @param props - Fee transfer parameters: the source `resource`, `tokenSymbol`
   *   (`"USDC"`, `"XAN"`, or `"WETH"`), `tokenContractAddress`, `quantity`, and the
   *   caller's `keyring`.
   * @returns {@link CreatedResources} with `actions`, `consumedResource`,
   *   `createdResource`, and optionally split resources.
   *
   * @example
   * ```typescript
   * const feeResult = logic.createFeeTransferResource({
   *   resource: myResource,
   *   tokenSymbol: "USDC",
   *   tokenContractAddress: "0x123...",
   *   quantity: 500n,
   *   keyring,
   * });
   * ```
   */
  createFeeTransferResource({
    resource,
    tokenSymbol,
    quantity,
    keyring,
  }: CreateFeeTransferProps): CreatedResources {
    const {
      HELIAX_FEE_LOGIC_REF,
      HELIAX_FEE_VALUE_REF,
      HELIAX_FEE_NULLIFIER_KEY_COMMITMENT,
    } = HeliaxKeys;
    const transferredResourceNullifier = resource.nullifier(
      new NullifierKey(keyring.nullifierKeyPair.nk)
    );
    const tokenLabelRef = tokenSymbolToLabelRef(tokenSymbol);

    const createdResource = Resource.create(
      Digest.fromHex(HELIAX_FEE_LOGIC_REF),
      Digest.fromHex(tokenLabelRef),
      BigInt(quantity),
      Digest.fromHex(HELIAX_FEE_VALUE_REF),
      false,
      transferredResourceNullifier,
      NullifierKeyCommitment.fromBase64(HELIAX_FEE_NULLIFIER_KEY_COMMITMENT)
    );

    const createdResourceCommitment = createdResource.commitment();

    const actions: Digest[] = [
      transferredResourceNullifier,
      createdResourceCommitment,
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
