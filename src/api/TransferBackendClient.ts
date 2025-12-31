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
import type { TransactionHashResponse } from "./types";

export class TransferBackendClient extends ApiClient {
  async transfer(props: Parameters): Promise<TransactionHashResponse> {
    return this.post<Parameters, TransactionHashResponse>(
      TransferBackendPaths.SendTransaction,
      props
    );
  }

  async estimateFee(props: FeeRequest): Promise<FeeResponse> {
    return this.post(TransferBackendPaths.EstimateFee, props);
  }

  async tokenPrice(tokenAddress: Address): Promise<TokenPriceResponse> {
    return this.get(
      `${TransferBackendPaths.TokenPrice}?address=${tokenAddress}`
    );
  }

  async tokenBalances(walletAddress: Address): Promise<TokenBalancesResponse> {
    return this.get(
      `${TransferBackendPaths.TokenBalances}?address=${walletAddress}`
    );
  }
}
