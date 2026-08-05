import { describe, expect, it } from "vitest";
import { buildUnwrapNativeCalls } from "../nativeCalls";

const WETH = "0x1111111111111111111111111111111111111111";
const ALICE = "0x2222222222222222222222222222222222222222";

describe("buildUnwrapNativeCalls", () => {
  it("withdraws the WETH, then forwards the native tokens", () => {
    expect(
      buildUnwrapNativeCalls({ weth: WETH, amount: 1000n, receiver: ALICE })
    ).toEqual([
      {
        to: WETH,
        value: 0n,
        // withdraw(uint256) selector + 1000
        data:
          "0x2e1a7d4d" +
          "00000000000000000000000000000000000000000000000000000000000003e8",
      },
      { to: ALICE, value: 1000n, data: "0x" },
    ]);
  });
});
