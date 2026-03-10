import { toBase64 } from "lib/utils";
import type {
  ConsumedResource,
  ConsumedResourceDraft,
  ConsumedWitnessDataSchema,
  CreatedResource,
  CreatedResourceDraft,
  CreatedWitnessDataSchema,
  Parameters,
  ResolvedParameters,
  UserKeyring,
} from "types";
import { PublicKey, type AuthoritySignature, type Digest } from "wasm";
import { authorizeActions } from "../services";

const formatPayloadKey = (key: Uint8Array<ArrayBufferLike>) =>
  new PublicKey(key).toBase64();

/**
 * Constructs the backend-compatible Parameters payload from resolved
 * consumed/created resource items, handling witness data generation
 * and authorization signing.
 */
export class PayloadBuilder {
  keyring: UserKeyring;
  consumingResources: ConsumedResourceDraft[];
  creatingResources: CreatedResourceDraft[];
  authorizationSignature: AuthoritySignature | undefined;

  constructor(keyring: UserKeyring, resolvedParameters: ResolvedParameters) {
    this.keyring = keyring;
    this.consumingResources = resolvedParameters.consumedResourceDrafts;
    this.creatingResources = resolvedParameters.createdResourceDrafts;
  }

  /** Signs all consumed/created resource pairs and stores the authorization signature. */
  withAuthorization() {
    const actions: Digest[] = [];
    for (let i = 0; i < this.consumingResources.length; i++) {
      actions.push(
        this.consumingResources[i].resource.nullifier(
          this.consumingResources[i].nullifierKey
        ),
        this.creatingResources[i].resource.commitment()
      );
    }
    this.authorizationSignature = authorizeActions(
      actions,
      this.keyring.authorityKeyPair.privateKey
    );
    return this;
  }

  /** Returns the witness data for a consumed resource based on its sender type. */
  getWitnessForConsumedResource(
    item: ConsumedResourceDraft
  ): Partial<ConsumedWitnessDataSchema> {
    // Consumed resources from AnomaPay (ex: Send / Claim)
    if (item.type === "AnomaAddress") {
      return {
        TokenTransferPersistent: {
          // The signature will be addeed later, when all actions are already defined
          sender_authorization_signature:
            this.authorizationSignature ?
              toBase64(this.authorizationSignature.toBytes())
            : "",
          sender_authorization_verifying_key: formatPayloadKey(
            item.userPublicKeys.authorityPublicKey
          ),
          sender_encryption_public_key: formatPayloadKey(
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
          permit2_data: item.permit2Data,
          sender_wallet_address: item.address,
          token_contract_address: item.token.address,
        },
      };
    }

    // Padding resources don't require any witness data
    if (item.type === "Padding") {
      return this.getWitnessForPaddingResource();
    }

    throw new Error("Unknown ConsumedResourceDraft type");
  }

  /** Returns the witness data for a created resource based on its receiver type. */
  getWitnessForCreatedResource(
    item: CreatedResourceDraft
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
          receiver_discovery_public_key: formatPayloadKey(
            item.receiver.userPublicKeys.discoveryPublicKey
          ),
          receiver_encryption_public_key: formatPayloadKey(
            item.receiver.userPublicKeys.encryptionPublicKey
          ),
          receiver_authorization_verifying_key: formatPayloadKey(
            item.receiver.userPublicKeys.authorityPublicKey
          ),
          token_contract_address: item.receiver.token.address,
        },
      };
    }

    // Resource destination -> Ethereum wallet
    if (item.receiver.type === "EvmAddress") {
      return {
        TokenTransferEphemeralUnwrap: {
          token_contract_address: item.receiver.token.address,
          receiver_wallet_address: item.receiver.address,
        },
      };
    }

    throw new Error("Unknown CreatedResourceDraft type");
  }

  /** Returns trivial ephemeral witness data used for padding resources. */
  getWitnessForPaddingResource() {
    return {
      TrivialEphemeral: {},
    };
  }

  /** Encodes a consuming item into the serialized consumed resource payload. */
  getConsumedResourcePayload(item: ConsumedResourceDraft): ConsumedResource {
    return {
      resource: item.resource.encode(),
      nullifier_key: item.nullifierKey.toBase64(),
      witness_data: this.getWitnessForConsumedResource(item),
    };
  }

  /** Encodes a creating item into the serialized created resource payload. */
  getCreatedResourcesPayload(item: CreatedResourceDraft): CreatedResource {
    return {
      resource: item.resource.encode(),
      witness_data: this.getWitnessForCreatedResource(item),
    };
  }

  /** Builds the final Parameters object by encoding all consumed and created resources. */
  build(): Parameters {
    return {
      consumed_resources: this.consumingResources.map(
        this.getConsumedResourcePayload.bind(this)
      ),
      created_resources: this.creatingResources.map(
        this.getCreatedResourcesPayload.bind(this)
      ),
    };
  }
}
