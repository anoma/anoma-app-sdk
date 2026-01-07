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
import { HeliaxKeys, PublicKey, type Resource } from "wasm";
import { checkMergeSplitParameters } from "../services";
import { TransferLogic } from "./TransferLogic";

/**
 * Build required backend Parameters request for mint, transfer, burn
 */
export class TransferBuilder {
  readonly client: TransferLogic;

  constructor(client: TransferLogic) {
    this.client = client;
  }

  static async init(): Promise<TransferBuilder> {
    const client = await TransferLogic.init();
    return new TransferBuilder(client);
  }

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
            Ephemeral: {
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
            Persistent: {
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

  buildTransferParameters(
    authorizedResources: AuthorizedResources,
    keyring: UserKeyring,
    receiverKeyring: UserPublicKeys,
    token: Address
  ): Parameters {
    const {
      authSig,
      consumedResource,
      createdResource,
      paddingResource,
      remainderResource,
    } = authorizedResources;

    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: new PublicKey(
        keyring.authorityKeyPair.publicKey
      ).toBase64(),
      sender_encryption_public_key: new PublicKey(
        keyring.encryptionKeyPair.publicKey
      ).toBase64(),
    };
    const createdWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key: new PublicKey(
        receiverKeyring.discoveryPublicKey
      ).toBase64(),
      receiver_encryption_public_key: new PublicKey(
        receiverKeyring.encryptionPublicKey
      ).toBase64(),
      // NOTE: The backend serializer will deserialize this AffinePoint to recover
      // auth veritying key as: AuthorizationVerifyingKey::from_affine(affine)
      receiver_authorization_verifying_key: new PublicKey(
        receiverKeyring.authorityPublicKey
      ).toBase64(),
      token_contract_address: token,
    };

    const parameters: Parameters = {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(keyring.nullifierKeyPair.nk),
          witness_data: {
            Persistent: consumedWitnessData,
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: { Persistent: createdWitnessData },
        },
      ],
    };

    return checkMergeSplitParameters(
      parameters,
      keyring,
      token,
      paddingResource,
      remainderResource
    );
  }

  buildBurnParameters(
    authorizedResources: AuthorizedResources,
    keyring: UserKeyring,
    token: Address,
    burnAddress: Address
  ): Parameters {
    const {
      authSig,
      consumedResource,
      createdResource,
      remainderResource,
      paddingResource,
    } = authorizedResources;

    const createdWitnessData: CreatedWitnessData["Ephemeral"] = {
      token_contract_address: token,
      receiver_wallet_address: burnAddress,
    };
    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: new PublicKey(
        keyring.authorityKeyPair.publicKey
      ).toBase64(),
      sender_encryption_public_key: new PublicKey(
        keyring.encryptionKeyPair.publicKey
      ).toBase64(),
    };
    const parameters: Parameters = {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(keyring.nullifierKeyPair.nk),
          witness_data: {
            Persistent: consumedWitnessData,
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: {
            Ephemeral: createdWitnessData,
          },
        },
      ],
    };

    return checkMergeSplitParameters(
      parameters,
      keyring,
      token,
      paddingResource,
      remainderResource
    );
  }

  buildFeeTransferParameters(
    authorizedResources: AuthorizedResources,
    keyring: UserKeyring,
    tokenContractAddress: Address
  ): Parameters {
    const {
      authSig,
      createdResource,
      consumedResource,
      paddingResource,
      remainderResource,
    } = authorizedResources;
    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: new PublicKey(
        keyring.authorityKeyPair.publicKey
      ).toBase64(),
      sender_encryption_public_key: new PublicKey(
        keyring.encryptionKeyPair.publicKey
      ).toBase64(),
    };

    const { HELIAX_FEE_ENCRYPTION_PK, HELIAX_FEE_DISCOVERY_PK } = HeliaxKeys;
    const createdWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key: HELIAX_FEE_DISCOVERY_PK,
      receiver_encryption_public_key: HELIAX_FEE_ENCRYPTION_PK,
    };

    const parameters = {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(keyring.nullifierKeyPair.nk),
          witness_data: {
            Persistent: consumedWitnessData,
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: { Persistent: createdWitnessData },
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
