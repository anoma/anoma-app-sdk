import { toBase64 } from "lib/utils";
import type { Parameters, Permit2Data, UserKeyring } from "types";
import type { Address } from "viem";
import { PublicKey, type Resource } from "wasm";
import { TransferLogic } from "./TransferLogic";

/**
 * Build required backend Parameters request for mint, transfer, burn
 */
export class TransferBuilder {
  readonly client: TransferLogic;

  constructor(client: TransferLogic) {
    this.client = client;
  }

  static async init(wasmUrl?: string): Promise<TransferBuilder> {
    const client = await TransferLogic.init(wasmUrl);
    return new TransferBuilder(client);
  }

  /** Builds the backend Parameters payload for a mint (deposit) transaction. */
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
}
