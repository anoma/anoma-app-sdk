import { maxBalanceInUsd } from "app-constants";
import { normalizeEvmAddress } from "lib/utils";
import type { Address } from "viem";

export function checkIfExceedsDepositLimit(opts: {
  currentBalanceInUsd: number;
  depositAmount: string;
  tokenAddress: Address;
  tokenPrices: Record<Address, number>;
}): boolean {
  const amount = Number(opts.depositAmount) || 0;
  const price =
    opts.tokenAddress ?
      (opts.tokenPrices[normalizeEvmAddress(opts.tokenAddress)] ?? 0)
    : 0;
  const projectedBalance = opts.currentBalanceInUsd + amount * price;
  return projectedBalance > maxBalanceInUsd;
}
