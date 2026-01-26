import type { EncodedResourceWithStatus } from "types";
import { isAddressEqual, type Address } from "viem";

export function getResourcesForToken(
  tokenAddress: Address,
  resources?: EncodedResourceWithStatus[]
): EncodedResourceWithStatus[] {
  if (!resources) return [];

  return resources.filter(r => {
    return isAddressEqual(r.erc20TokenAddress, tokenAddress);
  });
}
