import type { ResourcesWithBalance, TokenRegistry } from "types";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
import { getTokenByAddress } from "./tokenUtils";

export function getResourcesForToken(
  tokenAddress: Address,
  registry: TokenRegistry[],
  resources?: ResourcesWithBalance
): EncodedResource[] {
  if (!resources) return [];

  const token = getTokenByAddress(tokenAddress, registry);

  return (
    resources?.resources
      .filter(r => {
        const encodedData = r.resourceWithLabel.resource.encode();
        return encodedData.label_ref === token.label;
      })
      .map(({ resourceWithLabel }) => resourceWithLabel.resource.encode()) || []
  );
}
