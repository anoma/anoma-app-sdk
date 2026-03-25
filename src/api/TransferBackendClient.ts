import type { UUID } from "crypto";
import type {
  FeeRequest,
  FeeResponse,
  Parameters,
  TokenBalancesResponse,
  TokenPriceResponse,
} from "types";
import type { Address } from "viem";
import { ApiClient } from "./ApiClient";
import { TransferBackendPaths } from "./paths";
import type {
  StatusQueueResponse,
  TransactionHashResponse,
  TransactionStatusResponse,
} from "./types";

/**
 * HTTP client for the Anoma Pay proving backend.
 *
 * Wraps the backend REST API that accepts transfer {@link Parameters}, queues
 * them for zero-knowledge proof generation, and submits the resulting
 * transaction on-chain.
 *
 * Instantiate with the backend base URL:
 * ```typescript
 * const backend = new TransferBackendClient({ baseUrl: config.backendUrl });
 * ```
 */
export class TransferBackendClient extends ApiClient {
  /**
   * Submits a set of transfer {@link Parameters} to the proving backend.
   *
   * The backend validates the parameters, enqueues them for ZK proof generation,
   * and returns a UUID that can be used to poll the proving status via
   * {@link transactionStatus}.
   *
   * @param props - The fully-assembled {@link Parameters} produced by one of the
   *   `TransferBuilder.build*` methods.
   * @returns A {@link TransactionHashResponse} containing `transaction_hash` (a UUID).
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   *
   * @example
   * ```typescript
   * const { transaction_hash } = await backendClient.transfer(params);
   * const status = await backendClient.transactionStatus(transaction_hash);
   * ```
   */
  async transfer(props: Parameters): Promise<TransactionHashResponse> {
    return this.post<Parameters, TransactionHashResponse>(
      TransferBackendPaths.SendTransaction,
      props
    );
  }

  /**
   * Polls the proving status of a previously submitted transaction.
   *
   * @param uuid - The UUID returned by {@link transfer} in `transaction_hash`.
   * @returns A {@link TransactionStatusResponse} with a `status` field that
   *   progresses through `"New"` → `"Proving"` → `"Proven"` → `"Submitting"` →
   *   `"Submitted"`, or `"Failed"` / `"Unprocessable"` on error.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   *
   * @example
   * ```typescript
   * const { status, hash } = await backendClient.transactionStatus(uuid);
   * if (status === "Submitted") console.log("On-chain tx:", hash);
   * ```
   */
  async transactionStatus(uuid: UUID): Promise<TransactionStatusResponse> {
    return this.get<TransactionStatusResponse>(
      `${TransferBackendPaths.TransactionStatus}/${uuid}`
    );
  }

  /**
   * Requests a fee estimate for a given set of transfer parameters.
   *
   * @param props - A {@link FeeRequest} containing the `fee_token` symbol and
   *   the `transaction` parameters to estimate fees for.
   * @returns A {@link FeeResponse} with the estimated `fee` as a `bigint`.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   *
   * @example
   * ```typescript
   * const { fee } = await backendClient.estimateFee({
   *   fee_token: "USDC",
   *   transaction: params,
   * });
   * ```
   */
  async estimateFee(props: FeeRequest): Promise<FeeResponse> {
    return this.post(TransferBackendPaths.EstimateFee, props);
  }

  /**
   * Fetches the current USD price for a given ERC-20 token.
   *
   * @param tokenAddress - The ERC-20 contract address.
   * @returns A {@link TokenPriceResponse} with `address` and `usd_price`.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async tokenPrice(tokenAddress: Address): Promise<TokenPriceResponse> {
    return this.get(
      `${TransferBackendPaths.TokenPrice}?address=${tokenAddress}`
    );
  }

  /**
   * Fetches the ERC-20 token balances held by a wallet address.
   *
   * @param walletAddress - The EVM wallet address to query.
   * @returns An array of {@link TokenBalancesResponse} entries with balance and
   *   token metadata.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async tokenBalances(walletAddress: Address): Promise<TokenBalancesResponse> {
    return this.get(
      `${TransferBackendPaths.TokenBalances}?address=${walletAddress}`
    );
  }

  /**
   * Retrieves the current proving-queue statistics from the backend.
   *
   * @returns A {@link StatusQueueResponse} with `created`, `processing`, and
   *   `completed` counts.
   * @throws {@link ResponseError} On non-2xx HTTP responses.
   */
  async statsQueue(): Promise<StatusQueueResponse> {
    return this.get(TransferBackendPaths.StatsQueue);
  }
}
