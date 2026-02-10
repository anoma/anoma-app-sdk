import { maxBalanceInUsd } from "app-constants";
import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { checkIfExceedsDepositLimit } from "../depositValidation";

const TOKEN: Address = "0x0000000000000000000000000000000000000001";

const call = (
  overrides: Partial<Parameters<typeof checkIfExceedsDepositLimit>[0]> = {}
) =>
  checkIfExceedsDepositLimit({
    currentBalanceInUsd: 0,
    depositAmount: "0",
    tokenAddress: TOKEN,
    tokenPrices: { [TOKEN]: 1 },
    ...overrides,
  });

describe("exceedsDepositLimit", () => {
  it("blocks when existing balance already exceeds the limit", () => {
    expect(call({ currentBalanceInUsd: maxBalanceInUsd + 0.01 })).toBe(
      `Your balance would exceed the maximum allowed limit of $${maxBalanceInUsd}`
    );
  });

  it("blocks when deposit would push balance over the limit", () => {
    expect(
      call({
        currentBalanceInUsd: maxBalanceInUsd * 0.5,
        depositAmount: String(maxBalanceInUsd * 0.6),
      })
    ).toBe(
      `Your balance would exceed the maximum allowed limit of $${maxBalanceInUsd}`
    );
  });

  it("allows when projected balance equals the limit exactly", () => {
    expect(
      call({ currentBalanceInUsd: 0, depositAmount: String(maxBalanceInUsd) })
    ).toBeUndefined();
  });

  it("allows when projected balance is below the limit", () => {
    expect(
      call({
        currentBalanceInUsd: 0,
        depositAmount: String(maxBalanceInUsd * 0.5),
      })
    ).toBeUndefined();
  });

  it("allows when no token is selected (price defaults to 0)", () => {
    expect(
      call({ tokenAddress: undefined, depositAmount: "999" })
    ).toBeUndefined();
  });

  it("allows when balances are not loaded yet", () => {
    expect(
      call({ currentBalanceInUsd: undefined, depositAmount: "999" })
    ).toBeUndefined();
  });
});
