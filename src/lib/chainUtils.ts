import type { Network, SupportedChainConfig } from "types";

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
