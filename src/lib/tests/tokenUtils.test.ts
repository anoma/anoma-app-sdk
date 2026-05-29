import type { NetworkAddress, TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { isAllowedToken, usdCentsToTokenQuantity } from "../tokenUtils";

const usdc: TokenRegistry = {
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  decimals: 18,
  name: "USD Coin",
  symbol: "USDC",
  network: "bsc",
  feeEnabled: true,
};

describe("usdCentsToTokenQuantity", () => {
  it("converts USD cents to token units using price", () => {
    // $100.00 at $0.50/token => 200 tokens (18 decimals)
    const prices = {
      "bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": 0.5,
    } as Record<NetworkAddress, number>;
    expect(usdCentsToTokenQuantity(usdc, 10_000n, prices)).toBe(
      200_000000000000000000n
    );
  });

  it("returns 0 when the price is missing or zero", () => {
    expect(usdCentsToTokenQuantity(usdc, 10_000n, {})).toBe(0n);
  });
});

describe("isAllowedToken", () => {
  const allowed: TokenRegistry[] = [usdc];

  it("matches a token in the allow-list", () => {
    expect(isAllowedToken(allowed, "bsc", usdc.address)).toBe(true);
  });

  it("matches case-insensitively on the address", () => {
    expect(
      isAllowedToken(
        allowed,
        "bsc",
        usdc.address.toUpperCase() as `0x${string}`
      )
    ).toBe(true);
  });

  it("returns false when the network does not match", () => {
    expect(isAllowedToken(allowed, "ethereum", usdc.address)).toBe(false);
  });

  it("returns false when the address is not in the registry", () => {
    expect(
      isAllowedToken(
        allowed,
        "bsc",
        "0x0000000000000000000000000000000000000001"
      )
    ).toBe(false);
  });

  it("returns false for an empty allow-list", () => {
    expect(isAllowedToken([], "bsc", usdc.address)).toBe(false);
  });
});
