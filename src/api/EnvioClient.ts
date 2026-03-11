import { ApiClient } from "./ApiClient";
import type { ConsumedTagsResponse } from "./types";

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
  // Query for consumed tags, filtered by logicRef
  async publicNullifiers(
    logicRef: string,
    timestamp = 0
  ): Promise<ConsumedTagsResponse> {
    const envioEndpoint = this.url;

    const query = `
      query GetConsumedTags {
        Tag(
          where: {
            isConsumed: {_eq: true},
            logicRef: {_eq: "${logicRef}"},
            transaction: {
              evmTransaction: {
                timestamp: { _gte: ${timestamp} }
              }
            }
          }
          order_by: {
            transaction: {
              evmTransaction: {
                timestamp: asc
              }
            }
          }
        ) {
          id
          tagHash
          transaction {
            id
            evmTransaction {
              id
              txHash
              timestamp
            }
          }
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

    const result: GraphQLResponse<{ Tag: ConsumedTagsResponse }> =
      await response.json();

    if (result.errors) {
      throw new Error(String(result.errors));
    }

    return result.data?.Tag ?? [];
  }
}
