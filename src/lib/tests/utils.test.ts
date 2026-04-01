import { describe, expect, it } from "vitest";
import { extractNumericValue, formatFiatAmount } from "../utils";

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

  it("handles floating point precision issues for values near 0.01", () => {
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
