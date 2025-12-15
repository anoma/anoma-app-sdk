import { toBase64, toHex } from "lib/utils";
import type {
  ConsumedWitnessData,
  CreateBurnProps,
  CreateFeeTransferProps,
  CreateTransferProps,
  CreatedWitnessData,
  Parameters,
  Permit2Data,
  UserKeyring,
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

  buildTransferParameters(transferProps: CreateTransferProps): Parameters {
    const {
      authSig,
      consumedResource,
      createdResource,
      paddingResource,
      remainderResource,
    } = this.client.createTransferResource(transferProps);
    const { keyring, receiverKeyring } = transferProps;

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
      receiver_discovery_public_key: toHex(receiverKeyring.discoveryPublicKey),
      receiver_encryption_public_key: toHex(
        receiverKeyring.encryptionPublicKey
      ),
      receiver_authorization_verifying_key: toHex(
        receiverKeyring.authorityPublicKey
      ),
      token_contract_address: transferProps.token,
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
      transferProps.token,
      paddingResource,
      remainderResource
    );
  }

  buildBurnParameters(burnProps: CreateBurnProps): Parameters {
    const {
      authSig,
      consumedResource,
      createdResource,
      remainderResource,
      paddingResource,
    } = this.client.createBurnResource(burnProps);
    const { keyring } = burnProps;

    const createdWitnessData: CreatedWitnessData["Ephemeral"] = {
      token_contract_address: burnProps.token,
      receiver_wallet_address: burnProps.burnAddress,
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
      burnProps.token,
      paddingResource,
      remainderResource
    );
  }

  buildFeeTransferParameters(props: CreateFeeTransferProps): Parameters {
    const { keyring, tokenContractAddress } = props;

    const {
      authSig,
      createdResource,
      consumedResource,
      paddingResource,
      remainderResource,
    } = this.client.createFeeTransferResource(props);
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
