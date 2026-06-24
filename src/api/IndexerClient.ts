import type { Hex } from "viem";
import type { EncodedKeypair } from "wasm/armRisc0Bindings";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerAddKeysResponse,
  type IndexerCheckKeysSyncResponse,
  type IndexerContract,
  type IndexerHealthResponse,
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
    discoveryPrivateKey: Hex,
    contracts: IndexerContract[]
  ): Promise<IndexerResourceResponse> {
    const responses = await Promise.all(
      contracts.map(({ chain_id, contract_address }) =>
        this.get<IndexerResourceResponse>(
          `${IndexerPaths.Tags}/${chain_id}/${contract_address}/${discoveryPrivateKey}`
        )
      )
    );
    return {
      resources: responses.flatMap(r => r.resources),
    };
  }
}
