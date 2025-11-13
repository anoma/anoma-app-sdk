import { formatUnits } from "viem";

export const formatBalance = (
  amount: bigint,
  tokenDenom = 18,
  decimals = 2
): string => {
  const balance = Number(formatUnits(amount, tokenDenom));
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: decimals,
  }).format(balance);
};
