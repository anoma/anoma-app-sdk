import type { Address } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerHealthResponse,
  type IndexerResourceResponse,
  type ResponseJson,
} from "./types";

/**
 * HTTP client for the Anoma Pay indexer service.
 *
 * The indexer watches on-chain events and stores encrypted resource payloads
 * keyed by discovery tags. Use this client to:
 * - Register your discovery key so the indexer can tag resources addressed to you.
 * - Fetch your encrypted resource blobs for decryption and balance calculation.
 *
 * Instantiate with the indexer base URL:
 * ```typescript
 * const indexer = new IndexerClient({ baseUrl: config.indexerUrl });
 * ```
 */
export class IndexerClient extends ApiClient {
  /**
   * Registers an encoded discovery key pair with the indexer.
   *
   * Once registered, the indexer will scan new on-chain events and tag any
   * resources whose discovery ciphertext can be decrypted with this key,
   * making them retrievable via {@link resources}.
   *
   * @param keypair - The discovery key pair encoded for the indexer API
   *   (typically obtained from the WASM `PublicKey` helpers).
   * @returns A promise that resolves when the key is successfully registered.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   *
   * @example
   * ```typescript
   * const encodedKp = encodeDiscoveryKeypair(keyring.discoveryKeyPair);
   * await indexerClient.addKeys(encodedKp);
   * ```
   */
  async addKeys(keypair: EncodedKeypair): Promise<void> {
    this.post<EncodedKeypair, string>(IndexerPaths.AddKeys, keypair);
  }

  /**
   * Fetches all encrypted resource blobs tagged for the given discovery private key.
   *
   * The method first calls the indexer's health endpoint to retrieve the list of
   * indexed chain/contract pairs, then fetches resources for each pair in parallel
   * and merges the results.
   *
   * The returned blobs are encrypted; pass them to
   * {@link parseIndexerResourceResponse} with your keyring to decrypt and
   * deserialize them.
   *
   * @param discoveryPrivateKey - The hex or Base64-encoded discovery private key
   *   (from `keyring.discoveryKeyPair.privateKey`).
   * @returns An {@link IndexerResourceResponse} whose `resources` array contains
   *   the raw encrypted blobs and transaction hashes for all indexed contracts.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   *
   * @example
   * ```typescript
   * const { resources } = await indexerClient.resources(
   *   toHex(keyring.discoveryKeyPair.privateKey)
   * );
   * const decrypted = await parseIndexerResourceResponse(keyring, resources);
   * ```
   */
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

  /**
   * Retrieves the latest Merkle tree root from the indexer.
   *
   * @returns The root hash as a hex string.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async latestRoot(): Promise<string> {
    return this.get(IndexerPaths.LatestRoot);
  }

  /**
   * Generates a Merkle inclusion proof for a given leaf value.
   *
   * @param leaf - The leaf value (hex string) to generate a proof for.
   * @returns A {@link ResponseJson} containing the Merkle proof data.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async generateProof(leaf: string): Promise<ResponseJson> {
    return this.get(`${IndexerPaths.GenerateProof}/${leaf}`);
  }

  /**
   * Checks whether an EVM address is on the indexer's allow-list.
   *
   * @param address - The EVM address to check.
   * @returns An object with an `allowed` boolean.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async checkAllowedAddress(address: Address): Promise<{ allowed: boolean }> {
    return this.get(`${IndexerPaths.AllowList}/${address}`);
  }
}
