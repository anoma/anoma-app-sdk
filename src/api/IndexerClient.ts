import type { Hex } from "viem";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerAddKeysResponse,
  type IndexerCheckKeysSyncResponse,
  type IndexerContract,
  type IndexerContractResourcesResponse,
  type IndexerHealthResponse,
  type IndexerResource,
  type IndexerResourcesResponse,
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
    return this.post(IndexerPaths.AddKeys, keypair);
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

  async contractResources(
    discoveryPrivateKey: Hex,
    contract: IndexerContract
  ): Promise<IndexerResource[]> {
    const response = await this.get<IndexerContractResourcesResponse>(
      `${IndexerPaths.Tags}/${contract.chain_id}/${contract.contract_address}/${discoveryPrivateKey}`
    );
    return response.resources;
  }

  async resources(discoveryPrivateKey: Hex): Promise<IndexerResource[]> {
    const response = await this.get<IndexerResourcesResponse>(
      `${IndexerPaths.Tags}/${discoveryPrivateKey}`
    );
    return response.resources.flatMap(c => c.resources);
  }
}
