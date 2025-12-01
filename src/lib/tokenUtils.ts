import { tokenRegistry, type TokenRegistry } from "config/tokenRegistry";
import type { Address } from "viem";

const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  label: "",
  decimals: 6,
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
