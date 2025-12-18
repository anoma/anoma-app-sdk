import type { WalletBalance } from "hooks/useWalletBalances";
import type { ResourceBalance, TokenBalance, TokenRegistry } from "types";
import type { Address } from "viem";

const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  label: "",
  decimals: 6,
  network: "unknown",
  ...values,
});

export const getTokenByAddress = (
  address?: Address,
  registry?: TokenRegistry[]
): TokenRegistry =>
  registry?.find(token => token.address === address) ??
  getNotFoundToken({ address });

export const getTokenByLabel = (
  label?: string,
  registry?: TokenRegistry[]
): TokenRegistry =>
  registry?.find(token => token.label === label) ?? getNotFoundToken({ label });

export const getTokenBySymbol = (
  symbol?: string,
  registry?: TokenRegistry[]
): TokenRegistry =>
  registry?.find(
    token => token.symbol.toLowerCase() === symbol?.toLowerCase()
  ) ?? getNotFoundToken({ symbol });

export const convertResourceBalanceToTokenBalance = (
  balances: ResourceBalance[] = [],
  registry: TokenRegistry[]
) => {
  return balances.map(b => ({
    symbol: getTokenByLabel(b.label, registry).symbol,
    amount: b.quantity,
  }));
};

export const convertWalletBalanceToTokenBalance = (
  balances: WalletBalance[] = []
) => {
  return (
    balances.map(b => ({
      symbol: b.symbol,
      amount: b.value,
    })) ?? []
  );
};

export const findBalanceByToken = (
  balances: TokenBalance[],
  token?: TokenRegistry | TokenBalance
) => balances.find(t => t.symbol === token?.symbol);
