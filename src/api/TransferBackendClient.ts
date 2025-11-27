import { ApiClient } from "./ApiClient";
import { TransferBackendPaths } from "./paths";
import type {
  SplitRequest,
  TransactionResponse,
  TransactionHashResponse,
} from "./types";
import type { Parameters } from "types";

export class TransferBackendClient extends ApiClient {
  async postSplit(props: SplitRequest): Promise<TransactionResponse> {
    return this.post<SplitRequest, TransactionResponse>(
      TransferBackendPaths.Split,
      props
    );
  }

  // TODO: Remove previous endpoints, consider the naming of the following one:
  async transfer(props: Parameters): Promise<TransactionHashResponse> {
    return this.post<Parameters, TransactionHashResponse>(
      TransferBackendPaths.SendTransaction,
      props
    );
  }
}
