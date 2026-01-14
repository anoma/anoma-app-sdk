import { describe, expect, it } from "vitest";
import { selectTransferResources } from "../services";
import { transferResources as resources } from "./data";

describe("Resources service functions", () => {
  it("Can select a resource with a matching quantity", () => {
    const targetAmount = 2_000_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.length).toBe(1);
    expect(transferResources[0][0].quantity).toBe(targetAmount);
  });

  it("Can select multiple resources to fulfill transfer amount", () => {
    const targetAmount = 6_000_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.length).toBe(2);
    // Sum of all quantities should match target exactly
    expect(
      transferResources.reduce(
        (sum, [resource, _]) => (sum += resource.quantity),
        0n
      )
    ).toBe(targetAmount);
  });

  it("Can select a resource to split", () => {
    const targetAmount = 500_000n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.length).toBe(1);
    // Difference of quantity and remainder should match target exactly
    const [resource, amount] = transferResources[0];
    const remainder = resource.quantity - amount;
    expect(remainder).toBe(500_000n);
    expect(resource.quantity).toBe(1_000_000n);
    expect(resource.quantity - remainder).toBe(targetAmount);
  });

  it("Can select multiple resources with a split to fulfill transfer amount", () => {
    // The only way to fulfill this target is to sum 3 resources
    // and split the remaining one:
    const targetAmount = 9_712_345n;
    const transferResources = selectTransferResources(resources, targetAmount);
    expect(transferResources.length).toBe(4);
    const [splitResource, quantity] =
      transferResources[transferResources.length - 1];
    const resourceQuantitySum = transferResources.reduce(
      (sum, [resource, _]) => (sum += resource.quantity),
      0n
    );
    const remainder = resourceQuantitySum - targetAmount;
    expect(quantity).toBe(712_345n);
    expect(remainder).toBe(287_655n);
    expect(splitResource.quantity).toBe(1_000_000n);
    // Sum of all quantities + split resource quantity minus remainder should match target exactly
    expect(resourceQuantitySum - remainder).toBe(targetAmount);
  });
});
