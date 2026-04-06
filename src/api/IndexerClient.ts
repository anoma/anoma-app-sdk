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

  // TODO: temporary hardcoded base URL — should use this.url once the endpoint is on the main indexer
  async rpc<T = unknown>(
    chainId: number,
    body: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(
      `https://galileo.stag.heliax.fyi${IndexerPaths.Rpc}/${chainId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
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
