import { PublicKey, type AuthoritySignature, type Digest } from "@anomaorg/arm-bindings";
import { toBase64 } from "lib/utils";
import type {
  ConsumedResource,
  ConsumedWitnessDataSchema,
  ConsumeIntent,
  CreatedResource,
  CreatedWitnessDataSchema,
  CreateIntent,
  Parameters,
  ResolvedParameters,
} from "types";
import { authorizeActions } from "../services";

const formatPayloadKey = (key: Uint8Array<ArrayBufferLike>) =>
  new PublicKey(key).toBase64();

/**
 * Constructs the backend-compatible Parameters payload from resolved
 * consumed/created resource items, handling witness data generation
 * and authorization signing.
 */
export class PayloadBuilder {
  consumeIntents: ConsumeIntent[];
  createIntents: CreateIntent[];
  authorizationSignature: AuthoritySignature | undefined;

  constructor(resolvedParameters: ResolvedParameters) {
    this.consumeIntents = resolvedParameters.consumeIntents;
    this.createIntents = resolvedParameters.createIntents;
  }

  /** Signs all consumed/created resource pairs and stores the authorization signature. */
  withAuthorization(authorityPrivateKey: Uint8Array<ArrayBuffer>) {
    const actions: Digest[] = [];
    for (let i = 0; i < this.consumeIntents.length; i++) {
      actions.push(
        this.consumeIntents[i].resource.nullifier(
          this.consumeIntents[i].nullifierKey
        ),
        this.createIntents[i].resource.commitment()
      );
    }
    this.authorizationSignature = authorizeActions(
      actions,
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

    // Padding resources don't require any witness data
    if (item.type === "Padding") {
      return this.getWitnessForPaddingResource();
    }

    throw new Error("Unknown ConsumeIntent type");
  }

  /** Returns the witness data for a created resource based on its receiver type. */
  getWitnessForCreatedResource(
    item: CreateIntent
  ): Partial<CreatedWitnessDataSchema> {
    // Padding resources don't have a receiver or token address
    if (!item.receiver) {
      return this.getWitnessForPaddingResource();
    }

    // From now on, token is required
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

  /** Returns trivial ephemeral witness data used for padding resources. */
  getWitnessForPaddingResource() {
    return {
      TrivialEphemeral: {},
    };
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

  /** Builds the final Parameters object by encoding all consumed and created resources. */
  build(): Parameters {
    return {
      consumedResources: this.consumeIntents.map(
        this.getConsumedResourcePayload.bind(this)
      ),
      createdResources: this.createIntents.map(
        this.getCreatedResourcesPayload.bind(this)
      ),
    };
  }
}
