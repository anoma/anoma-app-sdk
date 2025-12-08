import { tokenRegistry } from "config/tokenRegistry";
import type { WalletBalance } from "hooks/useWalletBalances";
import type { ResourceBalance, TokenBalance, TokenRegistry } from "types";
import type { Address } from "viem";

const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  label: "",
  decimals: 6,
  network: "",
  ...values,
});

export const getTokenByAddress = (address?: Address): TokenRegistry =>
  tokenRegistry.find(token => token.address === address) ??
  getNotFoundToken({ address });

export const getTokenByLabel = (label?: string): TokenRegistry =>
  tokenRegistry.find(token => token.label === label) ??
  getNotFoundToken({ label });

export const getTokenBySymbol = (symbol?: string): TokenRegistry =>
  tokenRegistry.find(
    token => token.symbol.toLowerCase() === symbol?.toLowerCase()
  ) ?? getNotFoundToken({ symbol });

export const convertResourceBalanceToTokenBalance = (
  balances: ResourceBalance[] = []
) => {
  return balances.map(b => ({
    symbol: getTokenByLabel(b.label).symbol,
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
