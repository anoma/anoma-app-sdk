import {
  extractNumericValue,
  formatFiatAmount,
  formatTokenAmount,
} from "lib/utils";
import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";

describe("extractNumericValue", () => {
  it("returns plain integers", () => {
    expect(extractNumericValue("350")).toBe("350");
  });

  it("returns plain decimals with period", () => {
    expect(extractNumericValue("350.50")).toBe("350.50");
  });

  it("returns plain decimals when string finishes with . or ,", () => {
    expect(extractNumericValue("350.")).toBe("350");
    expect(extractNumericValue("350,")).toBe("350");
  });

  it("normalizes comma to period", () => {
    expect(extractNumericValue("350,50")).toBe("350.50");
  });

  it("extracts number from '350USD'", () => {
    expect(extractNumericValue("350USD")).toBe("350");
  });

  it("extracts number from '350 USD'", () => {
    expect(extractNumericValue("350 USD")).toBe("350");
  });

  it("extracts number from '350.1234 CURRENCY'", () => {
    expect(extractNumericValue("350.1234 CURRENCY")).toBe("350.1234");
  });

  it("normalizes comma from '350,50 EUR'", () => {
    expect(extractNumericValue("350,50 EUR")).toBe("350.50");
  });

  it("trims surrounding whitespace", () => {
    expect(extractNumericValue("  350 USD  ")).toBe("350");
  });

  it("returns null for non-numeric text", () => {
    expect(extractNumericValue("hello world")).toBeNull();
  });

  it("returns null for currency prefix like 'USD350'", () => {
    expect(extractNumericValue("USD350")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractNumericValue("")).toBeNull();
  });

  it("returns null for only whitespace", () => {
    expect(extractNumericValue("   ")).toBeNull();
  });
});

describe("formatFiatAmount", () => {
  it("returns '0.00' for zero", () => {
    expect(formatFiatAmount(0)).toBe("0.00");
  });

  it("returns '<0.01' for values that round to less than 0.01", () => {
    expect(formatFiatAmount(0.001)).toBe("<0.01");
    expect(formatFiatAmount(0.004)).toBe("<0.01");
  });

  it("returns formatted value for values that round to 0.01 or above", () => {
    // Values that round to 0.01
    expect(formatFiatAmount(0.005)).toBe("0.01");
    expect(formatFiatAmount(0.009)).toBe("0.01");
    expect(formatFiatAmount(0.01)).toBe("0.01");
    expect(formatFiatAmount(0.014)).toBe("0.01");

    // Larger values
    expect(formatFiatAmount(0.1)).toBe("0.10");
    expect(formatFiatAmount(1)).toBe("1.00");
    expect(formatFiatAmount(1234.56)).toBe("1,234.56");
  });

  it("handles floating point precision issues for values near $0.01", () => {
    // Simulating floating point accumulation that results in 0.00999999...
    const floatingPointValue = 0.01 - Number.EPSILON;
    expect(formatFiatAmount(floatingPointValue)).toBe("0.01");

    // Simulating accumulated value that should be 0.01
    const accumulatedValue = 0.001 + 0.002 + 0.003 + 0.004;
    expect(formatFiatAmount(accumulatedValue)).toBe("0.01");

    // More realistic floating point errors from multiplication
    const priceCalc = 0.1 * 0.1; // Should be 0.01, might have precision issues
    expect(formatFiatAmount(priceCalc)).toBe("0.01");
  });
});

const mockToken: TokenRegistry = {
  symbol: "usdc",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  network: "bsc",
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
