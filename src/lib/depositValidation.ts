import { maxBalanceInUsd } from "app-constants";
import { normalizeEvmNetworkAddress } from "lib/utils";
import type { NetworkAddress } from "types";

export function checkIfExceedsDepositLimit(opts: {
  currentBalanceInUsd: number;
  depositAmount: string;
  tokenAddress: NetworkAddress;
  tokenPrices: Record<NetworkAddress, number>;
}): boolean {
  const amount = Number(opts.depositAmount) || 0;
  const price =
    opts.tokenAddress ?
      (opts.tokenPrices[normalizeEvmNetworkAddress(opts.tokenAddress)] ?? 0)
      : 0;
  const projectedBalance = opts.currentBalanceInUsd + amount * price;
  return projectedBalance > maxBalanceInUsd;
}
