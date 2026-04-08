import type { Hex } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerAddKeysResponse,
  type IndexerContract,
  type IndexerHealthResponse,
  type IndexerResourceResponse,
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
