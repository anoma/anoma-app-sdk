import type { EncodedResourceWithStatus, ResourcesWithBalance } from "types";
import type { Address } from "viem";
import { getTokenByAddress } from "./tokenUtils";

export function getResourcesForToken(
  tokenAddress: Address,
  resources?: ResourcesWithBalance
): EncodedResourceWithStatus[] {
  if (!resources) return [];

  const token = getTokenByAddress(tokenAddress);

  return resources?.resources.filter(r => {
    return r.label_ref === token.label;
  });
}
