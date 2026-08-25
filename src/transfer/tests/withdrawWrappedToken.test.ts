import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import {
  buildUnwrapNativeCalls,
  nativeSymbolFor,
} from "../withdrawWrappedToken";

const WETH = "0x1111111111111111111111111111111111111111";
const ALICE = "0x2222222222222222222222222222222222222222";

const token = (overrides: Partial<TokenRegistry>): TokenRegistry => ({
  address: WETH,
  decimals: 18,
  name: "Wrapped Ether",
  symbol: "WETH",
  network: "ethereum",
  feeEnabled: true,
  ...overrides,
});

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

describe("nativeSymbolFor", () => {
  it("returns the native symbol for a network's canonical wrapper", () => {
    expect(nativeSymbolFor(token({}))).toBe("ETH");
    expect(nativeSymbolFor(token({ network: "arbitrum" }))).toBe("ETH");
  });

  it("matches the symbol case-insensitively", () => {
    expect(nativeSymbolFor(token({ symbol: "weth" }))).toBe("ETH");
  });

  it("returns undefined for bridged WETH, whose native is not ETH", () => {
    // Binance-Peg / bridged ERC-20s expose no withdraw() — unwrapping reverts.
    expect(nativeSymbolFor(token({ network: "bsc" }))).toBeUndefined();
    expect(nativeSymbolFor(token({ network: "monad" }))).toBeUndefined();
  });

  it("returns undefined for a non-wrapped token on a mapped network", () => {
    expect(nativeSymbolFor(token({ symbol: "USDC" }))).toBeUndefined();
  });

  it("returns undefined when no token is selected", () => {
    expect(nativeSymbolFor(undefined)).toBeUndefined();
  });
});
