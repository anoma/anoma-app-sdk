import { ApiClient } from "./ApiClient";
import type { NullifierResponse } from "./types";

type GraphQLError = {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
};

type GraphQLResponse<TData = unknown> = {
  data?: TData;
  errors?: GraphQLError[];
  extensions?: Record<string, unknown>;
};

export class EnvioClient extends ApiClient {
  async nullifiers(logicRef: string): Promise<NullifierResponse> {
    const envioEndpoint = this.url;

    // Query for consumed transactions, optionally filtered by logic_ref through transactionExecuted
    const query = `
      query GetConsumedTags {
        Tag(where: {isConsumed: {_eq: true}, logicRef: {_eq: "${logicRef}"}}) {
          id
          tagHash
        }
      }
    `;

    const response = await fetch(envioEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<{
      Tag: { id: string; tagHash: string }[];
    }> = await response.json();

    if (result.errors) {
      throw new Error(String(result.errors));
    }

    // Return the consumed tags nullifiers
    return result.data?.Tag.map(tx => tx.tagHash) ?? [];
  }
}
