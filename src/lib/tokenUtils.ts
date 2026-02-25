import {
  BaseMainnetForwarderContract,
  EthereumMainnetForwarderContract,
  EthereumSepoliaForwarderContract,
} from "app-constants";
import type { AggregatedTokenBalance } from "hooks/resources/useAggregatedTokenBalances";
import type { WalletBalance } from "hooks/resources/useWalletBalances";
import type {
  AppResource,
  Network,
  TokenBalance,
  TokenId,
  TokenRegistry,
  TokenRegistryIndex,
} from "types";
import type { Address } from "viem";
import { normalizeEvmAddress } from "./utils";

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
};

export const getNetworkByForwarder = (forwarder: Address): Network => {
  return networkMap[forwarder.toLowerCase()] ?? "unknown";
};

/**
 * Gets the token registry entry for a given resource.
 * @param registry - The token registry index to search
 * @param resource - The encoded resource with status information
 * @returns The matching token registry or a placeholder for unknown tokens
 */
export const getTokenByResource = (
  registry: TokenRegistryIndex,
  resource: AppResource
): TokenRegistry => {
  const address = resource.erc20TokenAddress;
  const network = getNetworkByForwarder(resource.forwarder);
  return (
    registry.byAddress[normalizeEvmAddress(address)] ??
    getNotFoundToken({ address, network })
  );
};

export const getTokenByAddress = (
  registry: TokenRegistryIndex,
  address?: Address
): TokenRegistry =>
  (address && registry.byAddress[normalizeEvmAddress(address)]) ??
  getNotFoundToken({ address });

export const getTokenBySymbol = (
  registry: TokenRegistryIndex,
  symbol?: string
): TokenRegistry =>
  Object.values(registry.byTokenId).find(token => token.symbol === symbol) ??
  getNotFoundToken({ symbol });

/** Finds a token registry entry matching both network and symbol. */
export const getTokenById = (
  registry: TokenRegistryIndex,
  tokenId: TokenId
): TokenRegistry | undefined =>
  Object.values(registry.byTokenId).find(
    t => `${t.network}:${t.symbol}` === tokenId
  );

/**
 * Converts aggregated token balances to TokenBalance array format
 * for use in transfer forms and other components.
 * @param registry - The token registry index to look up tokens in
 * @param balancesPerToken - Record of token balances from useAggregatedTokenBalances
 * @returns Array of TokenBalance objects with full token registry and amount
 */
export const convertAggregatedToTokenBalance = (
  registry: TokenRegistryIndex,
  balancesPerToken: Record<TokenId, AggregatedTokenBalance>
): TokenBalance[] => {
  const tokenIds = Object.keys(balancesPerToken) as TokenId[];
  return tokenIds.flatMap(id => {
    const token = registry.byTokenId[id];
    if (!token) return [];
    return { token, amount: balancesPerToken[id].raw };
  });
};

export const convertWalletBalanceToTokenBalance = (
  registry: TokenRegistryIndex,
  balances: WalletBalance[] = []
): TokenBalance[] =>
  balances.reduce<TokenBalance[]>((acc, b) => {
    const token = registry.byAddress[normalizeEvmAddress(b.address)];
    if (token) acc.push({ token, amount: b.value });
    return acc;
  }, []);

export const tokenId = (
  tokenRegistry: Pick<TokenRegistry, "network" | "symbol">
): TokenId => {
  return `${tokenRegistry.network}:${tokenRegistry.symbol.toLowerCase()}`;
};

/** Finds the balance entry matching a given token registry by both network and symbol. */
export const findBalanceByToken = (
  balances: TokenBalance[],
  token?: TokenRegistry
) =>
  balances.find(
    t => t.token.symbol === token?.symbol && t.token.network === token?.network
  );
