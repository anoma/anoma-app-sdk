import { convertObjectToSnakeCase } from "lib/utils";
import type {
  VaultDataTransferObject,
  VaultRequestDataTransferObject,
} from "types";
import type { Address } from "viem";
import type { EncodedKeypair } from "wasm";
import { ApiClient } from "./ApiClient";
import { IndexerPaths } from "./paths";
import {
  type IndexerResourceResponse,
  type IndexerVaultResponse,
  type ResponseJson,
} from "./types";

export class IndexerClient extends ApiClient {
  async addKeys(keypair: EncodedKeypair): Promise<void> {
    this.post<EncodedKeypair, string>(IndexerPaths.AddKeys, keypair);
  }

  async resources(
    discoveryPrivateKey: string
  ): Promise<IndexerResourceResponse> {
    return this.get<IndexerResourceResponse>(
      `${IndexerPaths.Tags}/${discoveryPrivateKey}`
    );
  }

  async latestRoot(): Promise<string> {
    return this.get(IndexerPaths.LatestRoot);
  }

  async generateProof(leaf: string): Promise<ResponseJson> {
    return this.get(`${IndexerPaths.GenerateProof}/${leaf}`);
  }

  async storeUserKeys(userDto: VaultDataTransferObject) {
    const parsedObj = convertObjectToSnakeCase(userDto);
    return this.post(IndexerPaths.StoreKeyring, parsedObj);
  }

  async checkAllowedAddress(address: Address): Promise<{ allowed: boolean }> {
    return this.get(`${IndexerPaths.AllowList}/${address}`);
  }

  async fetchUserKeys(
    vaultRequestDto: VaultRequestDataTransferObject
  ): Promise<IndexerVaultResponse> {
    const parsedObj = convertObjectToSnakeCase(vaultRequestDto);
    return this.post(IndexerPaths.RetrieveKeyring, parsedObj);
  }
}
