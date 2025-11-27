import { ApiClient } from "./ApiClient";
import type { NullifierResponse } from "./types";

export class EnvioClient extends ApiClient {
  async nullifiers(logicRef?: string): Promise<NullifierResponse[]> {
    const envioEndpoint = this.url;

    // Query for consumed transactions, optionally filtered by logic_ref through transactionExecuted
    const whereClause = logicRef
      ? `{isConsumed: {_eq: true}, transactionExecuted: {logicRefs: {_contains: ["${logicRef}"]}}}`
      : `{isConsumed: {_eq: true}}`;

    const query = `
      query GetConsumedTransactions {
        ProtocolAdapter_Transaction(where: ${whereClause}) {
          id
          tag
          isConsumed
          transactionExecuted {
            logicRefs
          }
        }
      }
    `;

    try {
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

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return [];
      }

      const consumedTransactions =
        result.data.ProtocolAdapter_Transaction || [];

      // Return the consumed transaction tags as nullifiers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nullifiers = consumedTransactions.map((tx: any, index: number) => ({
        nullifier: tx.tag,
        index: index.toString(),
        source: "consumed_transaction_tag",
      }));

      return nullifiers;
    } catch {
      return [];
    }
  }
}
