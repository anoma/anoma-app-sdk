import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { formatTokenAmount } from "../format";

const mockToken: TokenRegistry = {
  symbol: "usdc",
  name: "USD Coin",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  network: "bsc",
  feeEnabled: false,
};



describe("formatTokenAmount", () => {
  it("appends the uppercase token symbol", () => {
    expect(formatTokenAmount("1.23", mockToken)).toBe("1.23 USDC");
  });

  it("limits decimals to 6 for normal amounts", () => {
    expect(formatTokenAmount("0.1234567890", mockToken)).toBe("0.123457 USDC");
  });

  it("rounds correctly when limiting to 6 decimals", () => {
    expect(formatTokenAmount("1.1234564", mockToken)).toBe("1.123456 USDC");
    expect(formatTokenAmount("1.1234565", mockToken)).toBe("1.123457 USDC");
  });

  it("preserves all decimals for very small numbers", () => {
    expect(formatTokenAmount("0.000000000001", mockToken)).toBe(
      "0.000000000001 USDC"
    );
    expect(formatTokenAmount("0.00000001234", mockToken)).toBe(
      "0.00000001234 USDC"
    );
  });

  it("preserves amounts with 6 or fewer decimal places", () => {
    expect(formatTokenAmount("0.123456", mockToken)).toBe("0.123456 USDC");
    expect(formatTokenAmount("0.12", mockToken)).toBe("0.12 USDC");
    expect(formatTokenAmount("100", mockToken)).toBe("100 USDC");
  });

  it("handles zero", () => {
    expect(formatTokenAmount("0", mockToken)).toBe("0 USDC");
  });

  it("does not lose precision with large decimal strings", () => {
    // parseFloat would mangle this — string-based rounding must preserve it
    expect(formatTokenAmount("9999999999999999.1234567890", mockToken)).toBe(
      "9999999999999999.123457 USDC"
    );
  });

  it("carries over rounding correctly", () => {
    expect(formatTokenAmount("0.9999999", mockToken)).toBe("1.000000 USDC");
    expect(formatTokenAmount("0.9999995", mockToken)).toBe("1.000000 USDC");
    expect(formatTokenAmount("0.9999994", mockToken)).toBe("0.999999 USDC");
  });
});
