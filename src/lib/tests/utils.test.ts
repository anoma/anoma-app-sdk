import { describe, expect, it } from "vitest";
import { formatFiatAmount } from "../utils";

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
