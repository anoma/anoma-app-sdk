import type { NetworkAddress, TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { usdCentsToTokenQuantity } from "../tokenUtils";

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
