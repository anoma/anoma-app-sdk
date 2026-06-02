import { defaultTokenId } from "lib-constants";
import type { AggregatedTokenBalance } from "domain/resources/types";
import type { WalletBalance } from "types";
import type {
  AppResource,
  Network,
  NetworkAddress,
  TokenBalance,
  TokenId,
  TokenRegistry,
} from "types";
import { formatUnits, parseUnits, type Address } from "viem";
import { normalizeEvmAddress, normalizeEvmNetworkAddress } from "./utils";

/** Creates a placeholder token registry entry for unknown or unresolved tokens. */
const getNotFoundToken = (values?: Partial<TokenRegistry>): TokenRegistry => ({
  symbol: "?",
  address: "0x",
  decimals: 6,
  name: "Unknown",
  network: "unknown",
  feeEnabled: false,
  ...values,
});

export const splitTokenId = (id: TokenId): [string, string] => {
  const parts = id.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid TokenId format: ${id}`);
  }
  return [parts[0], parts[1]];
};

/** Extracts `NetworkAddress` keys from a list of resources. */
export const resourceNetworkAddresses = (
  resources: AppResource[]
): NetworkAddress[] =>
  resources.map(r => networkAddress(r.network, r.erc20TokenAddress));

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

/** Resolves the fallback token from the registry, used when user has no balances. */
export const getFallbackBalance = (
  allTokens: TokenRegistry[],
  tokenId = defaultTokenId
): TokenBalance | undefined => {
  const fallback = getTokenById(allTokens, tokenId);
  if (!fallback) return undefined;
  return { token: fallback, amount: 0n };
};

export const getPriorityTokenBalance = (
  allTokens: TokenRegistry[],
  tokenBalances: TokenBalance[],
  defaultToken: TokenId,
  searchToken: string = ""
): TokenBalance | undefined => {
  const hasBalances = tokenBalances.length > 0;
  const [, defaultTokenSymbol] = splitTokenId(defaultToken);

  // No balances available => returns fallback token.
  if (!hasBalances) {
    return getFallbackBalance(allTokens, defaultToken);
  }

  // If a search token is provided (e.g. via URL param), try to find it among balances first.
  if (searchToken) {
    const match = tokenBalances.find(t => tokenId(t.token) === searchToken);
    if (match) return match;
  }

  // Sort held tokens to prioritize the default token, then pick the first one.
  const held = tokenBalances
    .filter(b => (b.amount ?? 0n) > 0n)
    .sort(t =>
      t.token.symbol.toLowerCase() === defaultTokenSymbol.toLowerCase() ? -1 : 1
    );

  // Try to find the default token among held tokens, otherwise fallback to the first held token or the zero-balance fallback.
  const defaultMatch = held.find(t => tokenId(t.token) === defaultTokenId);

  // Default token (if balance > 0) > first held token (prioritizing the default token symbol) > fallback (0 balance)
  return defaultMatch ?? held[0] ?? getFallbackBalance(allTokens, defaultToken);
};

/**
 * Gets the token registry entry for a given resource.
 * @param registry - The token registry index to search
 * @param resource - The encoded resource with status information
 * @returns The matching token registry or a placeholder for unknown tokens
 */
export const getTokenByResource = (
  tokens: TokenRegistry[],
  resource: AppResource
): TokenRegistry => {
  const address = resource.erc20TokenAddress;
  return (
    tokens.find(
      t =>
        normalizeEvmAddress(t.address) === normalizeEvmAddress(address) &&
        resource.network === t.network
    ) ?? getNotFoundToken({ address })
  );
};

/** Looks up a token in the registry by its network and contract address. */
export const getTokenByAddress = (
  registry: TokenRegistry[],
  network: Network,
  address: Address
): TokenRegistry => {
  return (
    findToken(registry, network, address) ??
    getNotFoundToken({ address, network })
  );
};

/** Finds a token registry entry matching a `TokenId` (network:symbol). */
export const getTokenById = (
  registry: TokenRegistry[],
  id: TokenId
): TokenRegistry | undefined => {
  return (
    registry.find(t => tokenId(t) === id) ??
    getNotFoundToken({ network: splitTokenId(id)[0] })
  );
};

/**
 * Converts aggregated token balances to TokenBalance array format
 * for use in transfer forms and other components.
 * @param registry - The token registry index to look up tokens in
 * @param balancesPerToken - Record of token balances from useAggregatedTokenBalances
 * @returns Array of TokenBalance objects with full token registry and amount
 */
export const convertAggregatedToTokenBalance = (
  registry: TokenRegistry[],
  balancesPerToken: Record<TokenId, AggregatedTokenBalance>
): TokenBalance[] => {
  const tokenIds = Object.keys(balancesPerToken) as TokenId[];
  return tokenIds.flatMap(id => {
    const token = registry.find(t => tokenId(t) === id);
    if (!token) return [];
    return {
      token,
      amount: balancesPerToken[id].raw,
      amountInUsd: balancesPerToken[id].amountInUsd,
    };
  });
};

export const findToken = (
  registry: TokenRegistry[],
  network: Network,
  address: Address
) =>
  registry.find(
    t =>
      t.network === network &&
      normalizeEvmAddress(t.address) === normalizeEvmAddress(address)
  );

/**
 * Returns true when `(network, address)` matches a token in the backend allow-list.
 * Used to drop user-derived data (resources, wallet balances) referencing tokens
 * no longer (or never) configured by the backend, so they don't leak into queries
 * like `useTokenPrices` that reject unknown tokens.
 */
export const isAllowedToken = (
  allowedTokens: TokenRegistry[],
  network: Network,
  address: Address
): boolean => !!findToken(allowedTokens, network, address);

export const findTokenBySymbol = (
  registry: TokenRegistry[],
  network: Network,
  symbol: string
) =>
  registry.find(
    t =>
      t.network.toLocaleLowerCase() === network.toLocaleLowerCase() &&
      t.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
  );

/** Converts raw wallet balances into `TokenBalance` entries, filtering out tokens not in the registry. */
export const convertWalletBalanceToTokenBalance = (
  registry: TokenRegistry[],
  balances: WalletBalance[] = [],
  prices?: Record<Address, number>
): TokenBalance[] =>
  balances.flatMap(b => {
    const token = findToken(registry, b.network, b.address);
    if (!token) return [];
    return {
      token,
      amount: b.value,
      amountInUsd: prices ? getFiatAmount(token, b.value, prices) : undefined,
    };
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
): TokenBalance | undefined => {
  if (!token) return undefined;
  const id = tokenId(token);
  return balances.find(t => tokenId(t.token) === id);
};

/** Normalized `network:address` key used to look a token up in a price map. */
const tokenPriceKey = (
  token: Pick<TokenRegistry, "network" | "address">
): NetworkAddress =>
  normalizeEvmNetworkAddress(networkAddress(token.network, token.address));

/** Computes the USD value of `quantity` of `token` using a price map (address → USD). */
export const getFiatAmount = (
  token: TokenRegistry,
  quantity: bigint,
  prices: Record<NetworkAddress, number>
): number => {
  const amount = Number(formatUnits(quantity, token.decimals));
  const price = prices[tokenPriceKey(token)] ?? 0;
  return amount * price;
};

/**
 * Inverse of {@link getFiatAmount}: derives a token amount (minimal denomination)
 * from a USD amount in integer cents and the same price map. Returns `0n` when no
 * price is available. Note that prices are floats, so this conversion is not exact.
 */
export const usdCentsToTokenQuantity = (
  token: TokenRegistry,
  usdCents: bigint,
  prices: Record<NetworkAddress, number>
): bigint => {
  const price = prices[tokenPriceKey(token)];
  if (!price) return 0n;
  const tokenFloat = Number(usdCents) / 100 / price;
  return parseUnits(String(tokenFloat), token.decimals);
};

export const groupTokensByAmount = (
  tokensQty: Array<[TokenRegistry, bigint]>,
  pricesInUsd: Record<NetworkAddress, number>
) => {
  const totals = new Map<TokenId, { token: TokenRegistry; total: number }>();
  for (const [token, quantity] of tokensQty) {
    const id = tokenId(token);
    const amountInUsd = getFiatAmount(token, quantity, pricesInUsd);
    const prev = totals.get(id);
    totals.set(id, {
      token,
      total: (prev?.total ?? 0) + amountInUsd,
    });
  }
  return totals;
};
