import { toBase64, toHex } from "lib/utils";
import type {
  ConsumedEphemeralProps,
  ConsumedWitnessData,
  CreateBurnProps,
  CreateMintProps,
  CreateTransferProps,
  CreatedPersistentProps,
  CreatedResources,
  CreatedWitnessData,
  Parameters,
} from "types";
import { NullifierKey, PublicKey, type Resource } from "wasm";
import { TransferLogic } from "./TransferLogic";

/**
 * Build required backend Parameters request for mint, transfer, split, burn
 */
export class TransferBuilder {
  protected client: TransferLogic;

  constructor(client: TransferLogic) {
    this.client = client;
  }

  static async init(): Promise<TransferBuilder> {
    const client = await TransferLogic.init();
    return new TransferBuilder(client);
  }

  buildMintResources(mintProps: CreateMintProps): CreatedResources {
    // Create the resources
    const { consumedResource, createdResource, actionTree } =
      this.client.createMintResources(mintProps);
    return {
      actionTree,
      consumedResource,
      createdResource,
    };
  }

  buildMintParameters(
    mintResources: {
      createdResource: Resource;
      consumedResource: Resource;
    },
    consumedWitnessProps: ConsumedEphemeralProps,
    createdWitnessProps: CreatedPersistentProps,
    nullifierKey: Uint8Array
  ): Parameters {
    const { createdResource, consumedResource } = mintResources;
    const {
      permit2Data: permit2_data,
      senderWalletAddress: sender_wallet_address,
      tokenContractAddress: consumed_token_contract_address,
    } = consumedWitnessProps;
    const {
      receiverDiscoveryPublicKey: receiver_discovery_public_key,
      receiverEncryptionPublicKey: receiver_encryption_public_key,
      authorityPublicKey: receiver_authorization_verifying_key,
      tokenContractAddress: created_token_contract_address,
    } = createdWitnessProps;

    return {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(nullifierKey),
          witness_data: {
            Ephemeral: {
              permit2_data,
              sender_wallet_address,
              token_contract_address: consumed_token_contract_address,
            },
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: {
            Persistent: {
              receiver_discovery_public_key,
              receiver_encryption_public_key,
              receiver_authorization_verifying_key,
              token_contract_address: created_token_contract_address,
            },
          },
        },
      ],
    };
  }

  buildTransferParameters(
    transferProps: CreateTransferProps,
    createdWitnessProps: CreatedPersistentProps,
    nullifierKey: Uint8Array
  ): Parameters {
    const { consumedResource, createdResource, authSig } =
      this.client.createTransferResource(transferProps);

    const {
      receiverDiscoveryPublicKey: receiver_discovery_public_key,
      receiverEncryptionPublicKey: receiver_encryption_public_key,
      authorityPublicKey: receiver_authorization_verifying_key,
      tokenContractAddress: token_contract_address,
    } = createdWitnessProps;

    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: toBase64(
        PublicKey.fromHex(
          toHex(transferProps.authKeypair.publicKey)
        ).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
      sender_encryption_public_key: toBase64(
        PublicKey.fromHex(transferProps.encryptionPublicKey).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
    };
    const createdWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key,
      receiver_encryption_public_key,
      receiver_authorization_verifying_key,
      token_contract_address,
    };

    return {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(nullifierKey),
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
  }

  buildBurnParameters(burnProps: CreateBurnProps): Parameters {
    const { authSig, consumedResource, createdResource } =
      this.client.createBurnResource(burnProps);

    const createdWitnessData: CreatedWitnessData["Ephemeral"] = {
      token_contract_address: burnProps.token,
      receiver_wallet_address: burnProps.burnAddress,
    };
    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: toBase64(
        PublicKey.fromHex(toHex(burnProps.authKeypair.publicKey)).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
      sender_encryption_public_key: toBase64(
        PublicKey.fromHex(burnProps.encryptionPublicKey).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
    };

    return {
      consumed_resources: [
        {
          resource: consumedResource.encode(),
          nullifier_key: toBase64(burnProps.burnNullifierKeypair.nk),
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
  }
  buildSplitTransferParameters(
    transferProps: CreateTransferProps,
    createdWitnessProps: CreatedPersistentProps,
    remainderWitnessProps: CreatedPersistentProps,
    nullifierKey: Uint8Array
  ): Parameters {
    const {
      receiverDiscoveryPublicKey: receiver_discovery_public_key,
      receiverEncryptionPublicKey: receiver_encryption_public_key,
      authorityPublicKey: receiver_authorization_verifying_key,
      tokenContractAddress: token_contract_address,
    } = createdWitnessProps;
    const {
      receiverDiscoveryPublicKey: sender_discovery_public_key,
      receiverEncryptionPublicKey: sender_encryption_public_key,
      authorityPublicKey: sender_authorization_verifying_key,
    } = remainderWitnessProps;

    const {
      consumedResource: toSplitResource,
      createdResource,
      paddingResource,
      remainderResource,
      authSig,
    } = this.client.createSplitTransfer(transferProps);

    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: toBase64(
        PublicKey.fromHex(
          toHex(transferProps.authKeypair.publicKey)
        ).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
      sender_encryption_public_key: toBase64(
        PublicKey.fromHex(transferProps.encryptionPublicKey).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
    };
    const createdWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key,
      receiver_encryption_public_key,
      receiver_authorization_verifying_key,
      token_contract_address,
    };
    const remainderWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key: sender_discovery_public_key,
      receiver_encryption_public_key: sender_encryption_public_key,
      receiver_authorization_verifying_key: sender_authorization_verifying_key,
      token_contract_address,
    };

    return {
      consumed_resources: [
        {
          resource: toSplitResource.encode(),
          nullifier_key: toBase64(nullifierKey),
          witness_data: {
            Persistent: consumedWitnessData,
          },
        },
        {
          resource: paddingResource.encode(),
          nullifier_key: NullifierKey.default().toBase64(),
          witness_data: {
            TrivialEphemeral: {},
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: { Persistent: createdWitnessData },
        },
        {
          resource: remainderResource.encode(),
          witness_data: { Persistent: remainderWitnessData },
        },
      ],
    };
  }

  buildSplitBurnParameters(
    burnProps: CreateBurnProps,
    remainderWitnessProps: CreatedPersistentProps
  ): Parameters {
    const {
      authSig,
      consumedResource: toSplitResource,
      paddingResource,
      remainderResource,
      createdResource,
    } = this.client.createSplitBurnResources(burnProps);
    const nullifierKey = burnProps.burnNullifierKeypair.nk;

    const {
      receiverDiscoveryPublicKey: sender_discovery_public_key,
      receiverEncryptionPublicKey: sender_encryption_public_key,
      authorityPublicKey: sender_authorization_verifying_key,
      tokenContractAddress: token_contract_address,
    } = remainderWitnessProps;

    const remainderWitnessData: CreatedWitnessData["Persistent"] = {
      receiver_discovery_public_key: sender_discovery_public_key,
      receiver_encryption_public_key: sender_encryption_public_key,
      receiver_authorization_verifying_key: sender_authorization_verifying_key,
      token_contract_address,
    };

    const createdWitnessData: CreatedWitnessData["Ephemeral"] = {
      token_contract_address: burnProps.token,
      receiver_wallet_address: burnProps.burnAddress,
    };
    const consumedWitnessData: ConsumedWitnessData["Persistent"] = {
      sender_authorization_signature: toBase64(authSig.toBytes()),
      sender_authorization_verifying_key: toBase64(
        PublicKey.fromHex(toHex(burnProps.authKeypair.publicKey)).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
      sender_encryption_public_key: toBase64(
        PublicKey.fromHex(burnProps.encryptionPublicKey).serialize() // serialize() returns the serde-serialized AffinePoint
      ),
    };

    return {
      consumed_resources: [
        {
          resource: toSplitResource.encode(),
          nullifier_key: toBase64(nullifierKey),
          witness_data: {
            Persistent: consumedWitnessData,
          },
        },
        {
          resource: paddingResource.encode(),
          nullifier_key: NullifierKey.default().toBase64(),
          witness_data: {
            TrivialEphemeral: {},
          },
        },
      ],
      created_resources: [
        {
          resource: createdResource.encode(),
          witness_data: { Ephemeral: createdWitnessData },
        },
        {
          resource: remainderResource.encode(),
          witness_data: { Persistent: remainderWitnessData },
        },
      ],
    };
  }
}
