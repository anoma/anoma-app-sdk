import {
  BaseMainnetForwarderContract,
  BaseSepoliaFowarderContract,
  EthereumMainnetForwarderContract,
  EthereumSepoliaForwarderContract,
} from "app-constants";
import { tokenRegistry } from "config/tokenRegistry";
import type { AggregatedTokenBalance } from "hooks/useAggregatedTokenBalances";
import type { WalletBalance } from "hooks/useWalletBalances";
import type {
  EncodedResourceWithStatus,
  Network,
  TokenBalance,
  TokenId,
  TokenRegistry,
} from "types";
import { isAddressEqual, type Address } from "viem";

const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  decimals: 6,
  network: "unknown",
  ...values,
});

const networkMap: Record<string, Network> = {
  [EthereumMainnetForwarderContract.toLowerCase()]: "ethereum",
  [EthereumSepoliaForwarderContract.toLowerCase()]: "ethereum-sepolia",
  [BaseMainnetForwarderContract.toLowerCase()]: "base",
  [BaseSepoliaFowarderContract.toLowerCase()]: "base-sepolia",
};

export const getNetworkByForwarder = (forwarder: Address): Network => {
  return networkMap[forwarder.toLowerCase()] ?? "unknown";
};

/**
 * Gets the token registry entry for a given resource.
 * @param resource - The encoded resource with status information
 * @returns The matching token registry or a placeholder for unknown tokens
 */
export const getTokenByResource = (
  resource: EncodedResourceWithStatus
): TokenRegistry => {
  const address = resource.erc20TokenAddress;
  const network = getNetworkByForwarder(resource.forwarder);
  return (
    tokenRegistry.find(
      token =>
        isAddressEqual(token.address, address) && token.network === network
    ) ?? getNotFoundToken({ address, network })
  );
};

export const getTokensByNetwork = (network?: Network): TokenRegistry[] => {
  return tokenRegistry.filter(registry => registry.network === network);
};

export const getTokenByAddress = (address?: Address): TokenRegistry =>
  (address &&
    tokenRegistry.find(token => isAddressEqual(token.address, address))) ??
  getNotFoundToken({ address });

export const getTokenBySymbol = (symbol?: string): TokenRegistry =>
  tokenRegistry.find(token => token.symbol === symbol) ??
  getNotFoundToken({ symbol });

/**
 * Converts aggregated token balances to TokenBalance array format
 * for use in transfer forms and other components.
 * @param balancesPerToken - Record of token balances from useAggregatedTokenBalances
 * @returns Array of TokenBalance objects with symbol, amount, and network
 */
export const convertAggregatedToTokenBalance = (
  balancesPerToken: Record<TokenId, AggregatedTokenBalance>
): TokenBalance[] => {
  return Object.entries(balancesPerToken).map(([tokenId, balance]) => ({
    symbol: balance.symbol,
    amount: balance.raw,
    network: getNetworkFromTokenId(tokenId),
  }));
};

export const convertWalletBalanceToTokenBalance = (
  balances: WalletBalance[] = []
): TokenBalance[] => {
  const allowedTokens = new Set(tokenRegistry.map(t => t.address));
  return (
    balances
      .filter(b => allowedTokens.has(b.address))
      .map(b => ({
        symbol: b.symbol,
        amount: b.value,
      })) ?? []
  );
};

export const tokenId = (tokenRegistry: TokenRegistry): TokenId => {
  return `${tokenRegistry.network}:${tokenRegistry.symbol}`;
};

export const findBalanceByToken = (
  balances: TokenBalance[],
  token?: TokenRegistry | TokenBalance
) => balances.find(t => t.symbol === token?.symbol);

export const getNetworkFromTokenId = (tokenId: TokenId) =>
  tokenId.split(":")[0];
