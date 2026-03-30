import type { AggregatedTokenBalance } from "domain/resources/types";
import { type Network } from "lib-constants";
import type {
  NetworkAddress,
  TokenBalance,
  TokenId,
  TokenRegistry,
  TokenRegistryIndex,
} from "types";
import type { Address } from "viem";
import { normalizeEvmAddress } from "./utils";

/** Creates a placeholder token registry entry for unknown or unresolved tokens. */
const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  decimals: 6,
  network: "unknown",
  ...values,
});

/** Builds a `NetworkAddress` key by combining a network and a normalized EVM address. */
export const networkAddress = (
  network: Network,
  address: Address
): NetworkAddress => `${network}:${normalizeEvmAddress(address)}`;

/** Builds a `TokenId` from a token's network and lowercased symbol (e.g. `"base:usdc"`). */
export const tokenId = (
  tokenRegistry: Pick<TokenRegistry, "network" | "symbol">
): TokenId => {
  return `${tokenRegistry.network}:${tokenRegistry.symbol.toLowerCase()}`;
};

/** Looks up a token in the registry by its network and contract address. */
export const getTokenByAddress = (
  registry: TokenRegistryIndex,
  network: Network,
  address?: Address
): TokenRegistry =>
  (address && registry.byAddress[networkAddress(network, address)]) ??
  getNotFoundToken({ address, network });

/** Finds a token registry entry matching both network and symbol. */
export const getTokenById = (
  registry: TokenRegistryIndex,
  id: TokenId
): TokenRegistry | undefined => registry.byTokenId[id];

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
/** Finds the balance entry matching a given token registry by both network and symbol. */
export const findBalanceByToken = (
  balances: TokenBalance[],
  token?: TokenRegistry
) => {
  if (!token) return undefined;
  const id = tokenId(token);
  return balances.find(t => tokenId(t.token) === id);
};
