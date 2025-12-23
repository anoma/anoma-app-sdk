import type { EncodedResourceWithStatus, ResourcesWithBalance } from "types";
import { isAddressEqual, type Address } from "viem";

export function getResourcesForToken(
  tokenAddress: Address,
  resources?: ResourcesWithBalance
): EncodedResourceWithStatus[] {
  if (!resources) return [];

  return resources?.resources.filter(r => {
    return isAddressEqual(r.erc20TokenAddress, tokenAddress);
  });
}
