import type { KeyPair } from "domain/keys";
import { toHex } from "lib";
import type { Hex } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  ResponseError,
  type IndexerAddKeysResponse,
  type IndexerCheckKeysSyncResponse,
  type IndexerContract,
  type IndexerHealthResponse,
  type IndexerResource,
  type IndexerResourceResponse,
  type NullifyingTransactionsResponse,
} from "./types";

export class IndexerClient extends ApiClient {
  async config(): Promise<IndexerHealthResponse> {
    return await this.get<IndexerHealthResponse>(IndexerPaths.Health);
  }

  async addKeys(keypair: {
    public_key: Hex;
    secret_key: Hex;
  }): Promise<IndexerAddKeysResponse> {
    return this.post<EncodedKeypair, IndexerAddKeysResponse>(
      IndexerPaths.AddKeys,
      keypair
    );
  }

  async checkKeysSync(privateKey: Hex): Promise<IndexerCheckKeysSyncResponse> {
    return this.get<IndexerCheckKeysSyncResponse>(
      IndexerPaths.CheckKeysSync + "/" + privateKey
    );
  }

  /**
   * Given the user's own nullifier tags, returns the subset that have already
   * been consumed, grouped by chain/contract, along with their nullifying tx.
   */
  async nullifyingTransactions(
    nullifiers: string[]
  ): Promise<NullifyingTransactionsResponse> {
    return this.post<{ nullifiers: string[] }, NullifyingTransactionsResponse>(
      IndexerPaths.NullifyingTransactions,
      { nullifiers }
    );
  }

  async resources(
    discoveryKeyPair: KeyPair,
    contracts: IndexerContract[]
  ): Promise<IndexerResource[]> {
    const discoveryPrivateKey = toHex(discoveryKeyPair.privateKey);

    const fetchResources = async () => {
      const responses = await Promise.all(
        contracts.map(({ chain_id, contract_address }) =>
          this.get<IndexerResourceResponse>(
            `${IndexerPaths.Tags}/${chain_id}/${contract_address}/${discoveryPrivateKey}`
          )
        )
      );
      return responses.flatMap(r => r.resources);
    };

    try {
      return fetchResources();
    } catch (error) {
      // add the keypair if it was not previously added, then refetch
      if (error instanceof ResponseError && error.status === 404) {
        await this.addKeys({
          public_key: toHex(discoveryKeyPair.publicKey),
          secret_key: discoveryPrivateKey,
        });
        return fetchResources();
      }
      throw error;
    }
  }
}
