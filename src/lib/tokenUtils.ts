import {
  BaseMainnetForwarderContract,
  EthereumSepoliaForwarderContract,
} from "app-constants";
import { tokenRegistry } from "config/tokenRegistry";
import type { WalletBalance } from "hooks/useWalletBalances";
import type {
  EncodedResourceWithStatus,
  Network,
  ResourceBalance,
  TokenBalance,
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
  [EthereumSepoliaForwarderContract.toLowerCase()]: "eth-sepolia",
  [BaseMainnetForwarderContract.toLowerCase()]: "base-mainnet",
  // TODO: lint fix, uncomment this when BaseMainnetForwarderContract !== BaseSepoliaFowarderContract
  // [BaseSepoliaFowarderContract]: "base-sepolia",
};

export const getNetworkByForwarder = (forwarder: Address): Network => {
  return networkMap[forwarder.toLowerCase()] ?? "unknown";
};

export const getTokenByResource = (
  resource: ResourceBalance | EncodedResourceWithStatus
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

export const convertResourceBalanceToTokenBalance = (
  balances: ResourceBalance[] = []
) => {
  return balances.map(b => ({
    symbol: getTokenByResource(b).symbol,
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
