import {
  BaseMainnetForwarderContract,
  EthereumMainnetForwarderContract,
  EthereumSepoliaForwarderContract,
} from "app-constants";
import { tokenRegistry } from "config/tokenRegistry";
import type { AggregatedTokenBalance } from "hooks/resources/useAggregatedTokenBalances";
import type { WalletBalance } from "hooks/resources/useWalletBalances";
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

/** Finds a token registry entry matching both network and symbol. */
export const getTokenById = (tokenId: TokenId): TokenRegistry | undefined =>
  tokenRegistry.find(t => `${t.network}:${t.symbol}` === tokenId);

/**
 * Converts aggregated token balances to TokenBalance array format
 * for use in transfer forms and other components.
 * @param balancesPerToken - Record of token balances from useAggregatedTokenBalances
 * @returns Array of TokenBalance objects with full token registry and amount
 */
export const convertAggregatedToTokenBalance = (
  balancesPerToken: Record<TokenId, AggregatedTokenBalance>
): TokenBalance[] => {
  const tokenIds = Object.keys(balancesPerToken) as TokenId[];
  return tokenIds.flatMap(tokenId => {
    const token = getTokenById(tokenId);
    if (!token) return [];
    return { token, amount: balancesPerToken[tokenId].raw };
  });
};

export const convertWalletBalanceToTokenBalance = (
  balances: WalletBalance[] = []
): TokenBalance[] => {
  return balances.reduce<TokenBalance[]>((acc, b) => {
    const token = tokenRegistry.find(t => isAddressEqual(t.address, b.address));
    if (token) acc.push({ token, amount: b.value });
    return acc;
  }, []);
};

export const tokenId = (tokenRegistry: TokenRegistry): TokenId => {
  return `${tokenRegistry.network}:${tokenRegistry.symbol}`;
};

/** Finds the balance entry matching a given token registry. */
export const findBalanceByToken = (
  balances: TokenBalance[],
  token?: TokenRegistry
) => balances.find(t => t.token.symbol === token?.symbol);

export const getNetworkFromTokenId = (tokenId: TokenId) =>
  tokenId.split(":")[0];
