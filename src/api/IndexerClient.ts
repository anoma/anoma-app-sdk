import { ApiClient } from "./ApiClient";
import type { EncodedKeypair } from "@anoma/lib";
import { IndexerPaths } from "./paths";
import { type IndexerResourceResponse, type ResponseJson } from "./types";

export class IndexerClient extends ApiClient {
  async addKeys(keypair: EncodedKeypair): Promise<void> {
    this.post<EncodedKeypair, string>(IndexerPaths.AddKeys, keypair);
  }

  async resources(publicKey: string): Promise<IndexerResourceResponse[]> {
    return this.get<IndexerResourceResponse[]>(
      `${IndexerPaths.Tags}/${publicKey}`
    );
  }

  async latestRoot(): Promise<string> {
    return this.get(IndexerPaths.LatestRoot);
  }

  async generateProof(leaf: string): Promise<ResponseJson> {
    return this.get(`${IndexerPaths.GenerateProof}/${leaf}`);
  }
}
