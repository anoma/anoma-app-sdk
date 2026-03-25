import { toBase64 } from "lib/utils";
import type {
  AuthorizedResources,
  ConsumedWitnessData,
  CreatedWitnessData,
  Parameters,
  Permit2Data,
  UserKeyring,
  UserPublicKeys,
} from "types";
import type { Address } from "viem";
import { PublicKey, type Resource } from "wasm";
import { checkMergeSplitParameters } from "../services";
import { TransferLogic } from "./TransferLogic";

/**
 * Assembles the {@link Parameters} payload required by the proving backend for
 * mint and transfer operations.
 *
 * `TransferBuilder` takes the raw resources produced by {@link TransferLogic}
 * and the caller's keyring and formats them—together with per-operation witness
 * data—into the `Parameters` object expected by {@link TransferBackendClient.transfer}.
 *
 * Always instantiate via the async {@link TransferBuilder.init} factory so the
 * underlying WASM module is ready before any build methods are called.
 *
 * @example
 * ```typescript
 * const builder = await TransferBuilder.init();
 * const params = builder.buildMintParameters(mintResources, permit2Data, evmAddr, tokenAddr, keyring);
 * ```
 */
export class TransferBuilder {
  /** The underlying {@link TransferLogic} client used to construct resources. */
  readonly client: TransferLogic;

  /**
   * @param client - An already-initialized {@link TransferLogic} instance.
   */
  constructor(client: TransferLogic) {
    this.client = client;
  }

  /**
   * Asynchronous factory that initializes the WASM module and returns a ready
   * `TransferBuilder` instance.
   *
   * @returns A fully-initialized {@link TransferBuilder}.
   *
   * @example
   * ```typescript
   * const builder = await TransferBuilder.init();
   * ```
   */
  static async init(): Promise<TransferBuilder> {
    const client = await TransferLogic.init();
    return new TransferBuilder(client);
  }

  /**
   * Assembles the {@link Parameters} payload for a mint (ERC-20 deposit) operation.
   *
   * Wraps the ephemeral consumed resource with `TokenTransferEphemeralWrap` witness
   * data (Permit2 approval + sender wallet) and the created resource with
   * `TokenTransferPersistent` witness data (receiver public keys).
   *
   * @param mintResources - The `{ consumedResource, createdResource }` pair
   *   produced by {@link TransferLogic.createMintResources}.
   * @param permit2Data - Signed Permit2 approval data authorizing the ERC-20 transfer.
   * @param evmAddress - The sender's EVM wallet address.
   * @param tokenContractAddress - The ERC-20 token contract being deposited.
   * @param keyring - The caller's full {@link UserKeyring}.
   * @returns A {@link Parameters} object ready to submit to the proving backend.
   *
   * @example
   * ```typescript
   * const mintResources = logic.createMintResources({ ... });
   * const params = builder.buildMintParameters(
   *   mintResources,
   *   permit2Data,
   *   "0xSenderAddress",
   *   "0xTokenAddress",
   *   keyring
   * );
   * await backendClient.transfer(params);
   * ```
   */
  buildMintParameters(
    mintResources: {
      createdResource: Resource;
      consumedResource: Resource;
    },
    permit2Data: Permit2Data,
    evmAddress: Address,
    tokenContractAddress: Address,
    keyring: UserKeyring
  ): Parameters {
    const { createdResource, consumedResource } = mintResources;

    return {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(keyring.nullifierKeyPair.nk),
          witness_data: {
            TokenTransferEphemeralWrap: {
              permit2_data: permit2Data,
              sender_wallet_address: evmAddress,
              token_contract_address: tokenContractAddress,
            },
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: {
            TokenTransferPersistent: {
              receiver_discovery_public_key: new PublicKey(
                keyring.discoveryKeyPair.publicKey
              ).toBase64(),
              receiver_encryption_public_key: new PublicKey(
                keyring.encryptionKeyPair.publicKey
              ).toBase64(),
              receiver_authorization_verifying_key: new PublicKey(
                keyring.authorityKeyPair.publicKey
              ).toBase64(),
              token_contract_address: tokenContractAddress,
            },
          },
        },
      ],
    };
  }

  /**
   * Assembles the {@link Parameters} payload for a private peer-to-peer transfer.
   *
   * Both the consumed and created resources use `TokenTransferPersistent` witness
   * data. The consumed resource includes the sender's authorization signature and
   * public keys; the created resource includes the receiver's public keys. If the
   * authorized resources include `paddingResource` or `remainderResource`, they
   * are merged into the parameters automatically.
   *
   * @param authorizedResources - The signed resources produced after calling
   *   {@link TransferLogic.createTransferResource} and authorizing the action tree.
   * @param keyring - The sender's full {@link UserKeyring}.
   * @param receiverKeyring - The receiver's {@link UserPublicKeys} (no private keys required).
   * @param tokenContractAddress - The ERC-20 token contract address.
   * @returns A {@link Parameters} object ready to submit to the proving backend.
   *
   * @example
   * ```typescript
   * const params = builder.buildTransferParameters(
   *   authorizedResources,
   *   senderKeyring,
   *   receiverPublicKeys,
   *   "0xTokenAddress"
   * );
   * await backendClient.transfer(params);
   * ```
   */
  buildTransferParameters(
    authorizedResources: AuthorizedResources,
    keyring: UserKeyring,
    receiverKeyring: UserPublicKeys,
    tokenContractAddress: Address
  ): Parameters {
    const {
      authSig,
      consumedResource,
      createdResource,
      paddingResource,
      remainderResource,
    } = authorizedResources;

    const consumedWitnessData: ConsumedWitnessData["TokenTransferPersistent"] =
      {
        sender_authorization_signature: toBase64(authSig.toBytes()),
        sender_authorization_verifying_key: new PublicKey(
          keyring.authorityKeyPair.publicKey
        ).toBase64(),
        sender_encryption_public_key: new PublicKey(
          keyring.encryptionKeyPair.publicKey
        ).toBase64(),
      };
    const createdWitnessData: CreatedWitnessData["TokenTransferPersistent"] = {
      receiver_discovery_public_key: new PublicKey(
        receiverKeyring.discoveryPublicKey
      ).toBase64(),
      receiver_encryption_public_key: new PublicKey(
        receiverKeyring.encryptionPublicKey
      ).toBase64(),
      // NOTE: The backend serializer will deserialize this AffinePoint to recover
      // auth verifying key as: AuthorizationVerifyingKey::from_affine(affine)
      receiver_authorization_verifying_key: new PublicKey(
        receiverKeyring.authorityPublicKey
      ).toBase64(),
      token_contract_address: tokenContractAddress,
    };

    const parameters: Parameters = {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(keyring.nullifierKeyPair.nk),
          witness_data: {
            TokenTransferPersistent: consumedWitnessData,
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: { TokenTransferPersistent: createdWitnessData },
        },
      ],
    };

    return checkMergeSplitParameters(
      parameters,
      keyring,
      tokenContractAddress,
      paddingResource,
      remainderResource
    );
  }
}
