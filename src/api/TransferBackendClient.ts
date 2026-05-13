import type {
  FeeRequest,
  FeeResponse,
  Parameters,
  TokenBalancesResponse,
  TokenPriceResponse,
} from "types";
import type { Address } from "viem";
import { ApiClient } from "./ApiClient";
import { ApiPaths } from "./paths";
import type {
  ClientTransactionStatus,
  EstimateDurationResponse,
  NetworkConfigurationWrappedResponse,
  Permit2AllowanceResponse,
  SendTransactionResponse,
  TransactionResultResponse,
} from "./types";

export class TransferBackendClient extends ApiClient {
  async configuration(): Promise<NetworkConfigurationWrappedResponse> {
    return this.get<NetworkConfigurationWrappedResponse>(
      ApiPaths.Configuration()
    );
  }

  async transfer(
    network: string,
    params: Parameters
  ): Promise<SendTransactionResponse> {
    return this.post<Parameters, SendTransactionResponse>(
      ApiPaths.SendTransaction(network),
      params
    );
  }

  async estimateFee(network: string, params: FeeRequest): Promise<FeeResponse> {
    return this.post(ApiPaths.EstimateFee(network), params);
  }

  async tokenPrices(tokens: string[]): Promise<TokenPriceResponse> {
    return this.get(ApiPaths.TokenPrices(tokens));
  }

  async tokenBalances(
    network: string,
    walletAddress: Address
  ): Promise<TokenBalancesResponse> {
    return this.get(ApiPaths.TokenBalances(network, walletAddress));
  }

  async permit2Allowance(
    network: string,
    owner: Address,
    token: Address
  ): Promise<Permit2AllowanceResponse> {
    return this.get(ApiPaths.Permit2Allowance(network, owner, token));
  }

  async transactionResult(id: string): Promise<TransactionResultResponse> {
    return this.get(ApiPaths.TransactionResult(id));
  }

  async estimateDuration(
    network: string,
    parameters: Parameters
  ): Promise<EstimateDurationResponse> {
    return this.post(ApiPaths.EstimateDuration(network), parameters);
  }

  /**
   * Opens an SSE connection to observe transaction status updates.
   * Resolves with the final result when the transaction completes or fails.
   * Pass an AbortSignal to close the connection early (e.g. on unmount).
   */
  observeTransactionStatus(
    requestId: string,
    options?: {
      onStatus?: (status: ClientTransactionStatus) => void;
      signal?: AbortSignal;
    }
  ): Promise<TransactionResultResponse> {
    const { onStatus, signal } = options ?? {};

    return new Promise((resolve, reject) => {
      const url = this.endpoint(ApiPaths.TransactionStatus(requestId));
      const source = new EventSource(url);

      const finish = (fn: () => void) => {
        source.close();
        fn();
      };

      signal?.addEventListener(
        "abort",
        () => finish(() => reject(new DOMException("Aborted", "AbortError"))),
        { once: true }
      );

      source.addEventListener("status", (event: MessageEvent<string>) => {
        const data = JSON.parse(event.data) as TransactionResultResponse;
        onStatus?.(data.status);
        if (data.status === "completed" || data.status === "failed")
          finish(async () => {
            return this.transactionResult(requestId)
              .then(result =>
                data.status === "completed" ?
                  resolve(result)
                : reject(result.error)
              )
              .catch(e => reject(e));
          });
      });

      source.onerror = e =>
        finish(() => {
          if ("data" in e) {
            const json = JSON.parse(e.data + "") as { error: string };
            return reject(new Error(json.error));
          }
          return reject(new Error("SSE connection error"));
        });
    });
  }
}
