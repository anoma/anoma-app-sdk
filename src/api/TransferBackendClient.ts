import type { FeeRequest, FeeResponse, Parameters } from "types";
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
}
