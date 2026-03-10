import type { AppResource } from "types";

/**
 * A collection of transfer resources with the amount to transfer.
 * NOTE: Amount may be less than resource quantity, in this case,
 * we have a split:
 */
export type TransferResourceWithAmount = {
  resource: AppResource;
  targetAmount: bigint;
};

export type TransferResources = {
  selected: TransferResourceWithAmount[];
  remaining: AppResource[];
};
