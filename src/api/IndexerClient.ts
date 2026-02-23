import type { Address } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerHealthResponse,
  type IndexerResourceResponse,
  type ResponseJson,
} from "./types";

export class IndexerClient extends ApiClient {
  async addKeys(keypair: EncodedKeypair): Promise<void> {
    this.post<EncodedKeypair, string>(IndexerPaths.AddKeys, keypair);
  }

  async resources(
    discoveryPrivateKey: string
  ): Promise<IndexerResourceResponse> {
    const { indexed_contracts } = await this.get<IndexerHealthResponse>(
      IndexerPaths.Health
    );
    const responses = await Promise.all(
      indexed_contracts.map(({ chain_id, contract_address }) =>
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
