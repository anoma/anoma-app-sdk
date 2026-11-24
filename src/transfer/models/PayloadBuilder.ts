import {
  deriveNonceFromNullifiers,
  PublicKey,
  type AuthoritySignature,
  type Digest,
} from "@anomaorg/arm-bindings";
import { toBase64 } from "primitives";
import type {
  ConsumedResource,
  ConsumedWitnessDataSchema,
  ConsumeIntent,
  CreatedResource,
  CreatedWitnessDataSchema,
  CreateIntent,
  Parameters,
  ResolvedIntent,
  ResolvedParameters,
} from "types";
import { serializeGenericCalls } from "../genericCalls";
import { authorizeActions } from "../services";

const formatPayloadKey = (key: Uint8Array<ArrayBufferLike>) =>
  new PublicKey(key).toBase64();

/**
 * Constructs the backend-compatible Parameters payload from resolved intents,
 * handling nonce derivation, witness data generation and authorization signing.
 *
 * The whole transaction is a single action whose resources keep the order of
 * `intents`: the backend builds the action tree, and the protocol adapter runs
 * the forwarder calls, in that order.
 */
export class PayloadBuilder {
  intents: ResolvedIntent[];
  nullifiers: Digest[];
  authorizationSignature: AuthoritySignature | undefined;

  constructor(resolvedParameters: ResolvedParameters) {
    this.nullifiers = resolvedParameters.intents.flatMap(intent =>
      "consume" in intent ?
        [intent.consume.resource.nullifier(intent.consume.nullifierKey)]
      : []
    );
    // Created nonces commit to every consumed nullifier and to their index
    // among the created resources, so they can only be set once the action is final.
    let createdIndex = 0;
    this.intents = resolvedParameters.intents.map(intent => {
      if ("consume" in intent) return intent;
      const nonce = deriveNonceFromNullifiers(createdIndex++, this.nullifiers);
      return {
        create: {
          ...intent.create,
          resource: intent.create.resource.withNonce(nonce),
        },
      };
    });
  }

  /** Each resource's tag (nullifier or commitment), in action order. */
  private tags(): Digest[] {
    let consumedIndex = 0;
    return this.intents.map(intent =>
      "consume" in intent ?
        this.nullifiers[consumedIndex++]
      : intent.create.resource.commitment()
    );
  }

  /** Signs the action tree and stores the authorization signature. */
  withAuthorization(authorityPrivateKey: Uint8Array<ArrayBuffer>) {
    this.authorizationSignature = authorizeActions(
      this.tags(),
      authorityPrivateKey
    );
    return this;
  }

  /** Returns the witness data for a consumed resource based on its sender type. */
  getWitnessForConsumedResource(
    item: ConsumeIntent
  ): Partial<ConsumedWitnessDataSchema> {
    // Consumed resources from AnomaPay (ex: Send / Claim)
    if (item.type === "AnomaAddress") {
      return {
        TokenTransferPersistent: {
          // The signature will be addeed later, when all actions are already defined
          senderAuthorizationSignature:
            this.authorizationSignature ?
              toBase64(this.authorizationSignature.toBytes())
            : "",
          senderAuthorizationVerifyingKey: formatPayloadKey(
            item.userPublicKeys.authorityPublicKey
          ),
          senderEncryptionPublicKey: formatPayloadKey(
            item.userPublicKeys.encryptionPublicKey
          ),
        },
      };
    }

    // Consumed resources from EVM wallets (ex: Deposit)
    if (item.type === "EvmAddress") {
      if (!item.token) {
        throw new Error(
          "Token information is required for EVM address consuming resources"
        );
      }

      return {
        TokenTransferEphemeralWrap: {
          permit2Data: item.permit2Data,
          senderWalletAddress: item.address,
          tokenContractAddress: item.token.address,
        },
      };
    }

    // Generic-call resource carrying the swap's EVM calls (ex: Swap CU2)
    if (item.type === "GenericCall") {
      return {
        GenericCallEphemeral: {
          forwarderAddress: item.forwarderAddress,
          calls: serializeGenericCalls(item.calls),
        },
      };
    }

    throw new Error("Unknown ConsumeIntent type");
  }

  /** Returns the witness data for a created resource based on its receiver type. */
  getWitnessForCreatedResource(
    item: CreateIntent
  ): Partial<CreatedWitnessDataSchema> {
    if (!item.receiver.token) {
      throw new Error("Token information is required for created resources");
    }

    // Resource destination -> Anoma address (public keys)
    if (item.receiver.type === "AnomaAddress") {
      return {
        TokenTransferPersistent: {
          receiverDiscoveryPublicKey: formatPayloadKey(
            item.receiver.userPublicKeys.discoveryPublicKey
          ),
          receiverEncryptionPublicKey: formatPayloadKey(
            item.receiver.userPublicKeys.encryptionPublicKey
          ),
          receiverAuthorizationVerifyingKey: formatPayloadKey(
            item.receiver.userPublicKeys.authorityPublicKey
          ),
          tokenContractAddress: item.receiver.token.address,
        },
      };
    }

    // Resource destination -> Ethereum wallet
    if (item.receiver.type === "EvmAddress") {
      return {
        TokenTransferEphemeralUnwrap: {
          tokenContractAddress: item.receiver.token.address,
          receiverWalletAddress: item.receiver.address,
        },
      };
    }

    throw new Error("Unknown CreateIntent type");
  }

  /** Encodes a consume intent into the serialized consumed resource payload. */
  getConsumedResourcePayload(item: ConsumeIntent): ConsumedResource {
    return {
      resource: item.resource.encode(),
      nullifierKey: item.nullifierKey.toBase64(),
      witnessData: this.getWitnessForConsumedResource(item),
    };
  }

  /** Encodes a create intent into the serialized created resource payload. */
  getCreatedResourcesPayload(item: CreateIntent): CreatedResource {
    return {
      resource: item.resource.encode(),
      witnessData: this.getWitnessForCreatedResource(item),
    };
  }

  /** Builds the final Parameters object, keeping the action order. */
  build(): Parameters {
    return {
      resources: this.intents.map(intent =>
        "consume" in intent ?
          { consumed: this.getConsumedResourcePayload(intent.consume) }
        : { created: this.getCreatedResourcesPayload(intent.create) }
      ),
    };
  }
}
