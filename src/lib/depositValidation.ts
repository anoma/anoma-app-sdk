import { maxBalanceInUsd } from "app-constants";
import type { Address } from "viem";

export function checkIfExceedsDepositLimit(opts: {
  currentBalanceInUsd: number;
  depositAmount: string;
  tokenAddress: Address | undefined;
  tokenPrices: Record<Address, number> | undefined;
}): boolean {
  const amount = Number(opts.depositAmount) || 0;
  const price =
    opts.tokenAddress && opts.tokenPrices ?
      (opts.tokenPrices[opts.tokenAddress] ?? 0)
    : 0;
  const projectedBalance = opts.currentBalanceInUsd + amount * price;
  return projectedBalance > maxBalanceInUsd;
}
