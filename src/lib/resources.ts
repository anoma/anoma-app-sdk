import type { AppResource } from "types";
import { isAddressEqual, type Address } from "viem";

export function getResourcesForToken(
  tokenAddress: Address,
  resources?: AppResource[]
): AppResource[] {
  if (!resources) return [];

  return resources.filter(r => {
    return isAddressEqual(r.erc20TokenAddress, tokenAddress);
  });
}
