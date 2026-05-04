import type { Network, SupportedChainConfig } from "types";
import type { Address } from "viem";

export const findChainByNetwork = (
  chains: SupportedChainConfig[],
  network: Network
) => {
  return chains.find(
    (c: { network: string }) =>
      c.network.toLocaleLowerCase() === network.toLocaleLowerCase()
  );
};

/** Builds a map of network → full chain config for O(1) lookups. */
export const buildNetworkChainConfigMap = (
  chains: SupportedChainConfig[]
): Map<Network, SupportedChainConfig> => {
  const map = new Map<Network, SupportedChainConfig>();
  for (const chain of chains) {
    map.set(chain.network, chain);
  }
  return map;
};

/** Builds a map of forwarder address → network for O(1) lookups. */
export const buildForwarderNetworkMap = (
  chains: SupportedChainConfig[]
): Map<Address, Network> => {
  const map = new Map<Address, Network>();
  for (const chain of chains) {
    map.set(chain.forwarderAddress, chain.network);
  }
  return map;
};

/** Helper to get chainId by network. */
export const getChainIdByNetwork = (
  chains: SupportedChainConfig[],
  network?: Network
): number | undefined => {
  if (!network) return undefined;
  return chains.find(
    (c: { network: string }) =>
      c.network.toLocaleLowerCase() === network.toLocaleLowerCase()
  )?.chainId;
};
