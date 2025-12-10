import { describe, expect, it } from "vitest";
import { selectTransferResources } from "../services";
import { transferResources as resources } from "./data";

describe("Resources service functions", () => {
  it("Can select a resource with a matching quantity", () => {
    const targetAmount = 2_000_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.transfers.length).toBe(1);
    expect(transferResources.transfers[0].quantity).toBe(targetAmount);
    expect(transferResources.split).toBeUndefined();
  });

  it("Can select multiple resources to fulfill transfer amount", () => {
    const targetAmount = 6_000_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.transfers.length).toBe(2);
    // Sum of all quantities should match target exactly
    expect(
      transferResources.transfers.reduce(
        (sum, resource) => (sum += resource.quantity),
        0n
      )
    ).toBe(targetAmount);
    expect(transferResources.split).toBeUndefined();
  });

  it("Can select a resource to split", () => {
    const targetAmount = 500_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.transfers.length).toBe(0);
    expect(transferResources.split).toBeDefined();
    // Difference of quantity and remainder should match target exactly
    const {
      resource: { quantity = 0n },
      remainder = 0n,
    } = transferResources.split || { resource: {} };
    expect(remainder).toBe(500_000n);
    expect(quantity).toBe(1_000_000n);
    expect(quantity - remainder).toBe(targetAmount);
  });

  it("Can select multiple resources with a split to fulfill transfer amount", () => {
    // The only way to fulfill this target is to sum 3 resources
    // and split the remaining one:
    const targetAmount = 9_712_345n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.transfers.length).toBe(3);
    expect(transferResources.split).toBeDefined();
    const {
      resource: { quantity = 0n },
      remainder = 0n,
    } = transferResources.split || { resource: {} };
    expect(remainder).toBe(287_655n);
    expect(quantity).toBe(1_000_000n);
    // Sum of all quantities + split resource quantity minus remainder should match target exactly
    expect(
      transferResources.transfers.reduce(
        (sum, resource) => (sum += resource.quantity),
        0n
      ) +
        quantity -
        remainder
    ).toBe(targetAmount);
  });
});
