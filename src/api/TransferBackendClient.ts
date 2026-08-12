import type { EncodedResource } from "@anomaorg/arm-bindings";
import type {
  FeeRequest,
  FeeResponse,
  Parameters,
  TokenBalancesResponse,
  TokenPriceResponse,
  UUID,
} from "types";
import type { Address } from "viem";
import { ApiClient } from "./ApiClient";
import { ApiPaths } from "./paths";
import type {
  ClientTransactionStatus,
  EstimateDurationResponse,
  NetworkConfigurationWrappedResponse,
  Permit2AllowanceResponse,
  QuoteResponse,
  SendTransactionResponse,
  TransactionReceiptResponse,
  TransactionResultResponse,
} from "./types";

// Resources come from `Resource.encode()` (camelCase), backend needs as snake_case.
function formatParameters(parameters: Parameters) {
  const camelToSnake = (key: string): string =>
    key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`).replace(/^_/, "");

  const formatResource = (resource: EncodedResource) =>
    Object.fromEntries(
      Object.entries(resource).map(([key, value]) => [camelToSnake(key), value])
    );

  const formatArray = <T extends { resource: EncodedResource }>(array: T[]) =>
    array.map(({ resource, ...item }) => ({
      ...item,
      resource: formatResource(resource),
    }));

  return {
    ...parameters,
    consumedResources: formatArray(parameters.consumedResources),
    createdResources: formatArray(parameters.createdResources),
  };
}

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
    return this.post(
      ApiPaths.SendTransaction(network),
      formatParameters(params)
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

  async transactionResult(id: UUID): Promise<TransactionResultResponse> {
    return this.get(ApiPaths.TransactionResult(id));
  }

  async transactionReceipt(
    network: string,
    hash: string
  ): Promise<TransactionReceiptResponse> {
    return this.get(ApiPaths.TransactionReceipt(network, hash));
  }

  async estimateDuration(
    network: string,
    parameters: Parameters
  ): Promise<EstimateDurationResponse> {
    return this.post(
      ApiPaths.EstimateDuration(network),
      formatParameters(parameters)
    );
  }

  /**
   * Fetches a Bebop swap quote via the backend proxy, which injects the
   * `source-auth` token server-side. Returns Bebop's response verbatim.
   */
  async swapQuote(
    network: string,
    params: {
      sellTokenAddress: Address;
      buyTokenAddress: Address;
      sellAmount: bigint;
      genericForwarderAddress: Address;
    }
  ): Promise<QuoteResponse> {
    return this.get<QuoteResponse>(ApiPaths.SwapQuote(network, params));
  }

  /**
   * Opens an SSE connection to observe transaction status updates.
   * Resolves with the final result when the transaction completes or fails.
   * Pass an AbortSignal to close the connection early (e.g. on unmount).
   */
  observeTransactionStatus(
    requestId: UUID,
    options?: {
      onStatus?: (status: ClientTransactionStatus) => void;
      signal?: AbortSignal;
    }
  ): Promise<TransactionResultResponse> {
    const { onStatus, signal } = options ?? {};

    return new Promise((resolve, reject) => {
      const url = this.endpoint(ApiPaths.TransactionStatus(requestId));
      const source = new EventSource(url);
      let settled = false;

      const settle = (fn: () => void) => {
        // Only allow to settle the promise once
        if (settled) return;
        settled = true;
        source.close();
        fn();
      };

      signal?.addEventListener(
        "abort",
        () =>
          settle(() => {
            reject(new DOMException("Aborted", "AbortError"));
          }),
        { once: true }
      );

      source.addEventListener("status", (event: MessageEvent<string>) => {
        const data = JSON.parse(event.data) as TransactionResultResponse;
        onStatus?.(data.status);

        if (data.status === "completed") {
          settle(async () => {
            // Transaction result fetch may fail transiently after completion.
            // Retry indefinitely rather than rejecting and misleading the UI
            const getResult = (): Promise<TransactionResultResponse> =>
              this.transactionResult(requestId).catch(() =>
                new Promise(r => setTimeout(r, 500)).then(getResult)
              );
            getResult().then(resolve);
          });
        }

        if (data.status === "failed")
          settle(async () => {
            // Fetch failure reason from API, fall back to "Unknown reason" if unavailable
            let message: string = "Unknown reason";
            await this.transactionResult(requestId).then(result => {
              if (result.error) {
                message = result.error;
              }
            });
            const error = new Error(message);
            error.name = "TransactionFailed";
            reject(error);
          });
      });

      source.onerror = e => {
        settle(() => {
          if ("data" in e) {
            const json = JSON.parse(e.data + "") as { error: string };
            reject(new Error(json.error));
          }
          reject(new Error("SSE connection error"));
        });
      };
    });
  }
}
