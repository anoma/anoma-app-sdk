import { supportedChains } from "app-constants";
import type { AggregatedTokenBalance } from "domain/resources/types";
import type { WalletBalance } from "hooks/resources/useWalletBalances";
import type {
  AppResource,
  Network,
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

const networkMap: Record<string, Network> = Object.fromEntries(
  supportedChains.map(c => [c.forwarderAddress.toLowerCase(), c.network])
);

/** Resolves a forwarder contract address to its corresponding network. */
export const getNetworkByForwarder = (forwarder: Address): Network => {
  return networkMap[forwarder.toLowerCase()] ?? "unknown";
};

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
    registry.byAddress[networkAddress(network, address)] ??
    getNotFoundToken({ address, network })
  );
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

/** Converts raw wallet balances into `TokenBalance` entries, filtering out tokens not in the registry. */
export const convertWalletBalanceToTokenBalance = (
  registry: TokenRegistryIndex,
  network: Network,
  balances: WalletBalance[] = []
): TokenBalance[] =>
  balances.flatMap(b => {
    const token = registry.byAddress[networkAddress(network, b.address)];
    if (!token) return [];
    return { token, amount: b.value };
  });

/** Builds a `Record<TokenId, TokenBalance>` index for O(1) balance lookups. */
export const buildBalanceIndex = (
  balances: TokenBalance[]
): Record<TokenId, TokenBalance> => {
  const map = {} as Record<TokenId, TokenBalance>;
  for (const b of balances) {
    map[tokenId(b.token)] = b;
  }
  return map;
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
