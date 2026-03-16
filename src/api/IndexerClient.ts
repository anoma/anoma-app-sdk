import type { Address, Hex } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerAddKeysResponse,
  type IndexerContract,
  type IndexerHealthResponse,
  type IndexerResourceResponse,
  type ResponseJson,
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

  async latestRoot(): Promise<string> {
    return this.get(IndexerPaths.LatestRoot);
  }

  async generateProof(leaf: string): Promise<ResponseJson> {
    return this.get(`${IndexerPaths.GenerateProof}/${leaf}`);
  }

  async checkAllowedAddress(address: Address): Promise<{ allowed: boolean }> {
    return this.get(`${IndexerPaths.AllowList}/${address}`);
  }
}
