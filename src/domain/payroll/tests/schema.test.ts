import { encodePayAddress } from "lib/payAddress";
import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { getInsufficientFundsError, getRecipientErrors } from "../schema";
import type { PayrollRecipient } from "../types";

const VALID_ADDRESS = encodePayAddress({
  authorityPublicKey: new Uint8Array(33),
  discoveryPublicKey: new Uint8Array(33),
  encryptionPublicKey: new Uint8Array(33),
  nullifierKeyCommitment: new Uint8Array(32),
});

const usdc: TokenRegistry = {
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  decimals: 18,
  name: "USD Coin",
  symbol: "USDC",
  network: "bsc",
  feeEnabled: true,
};

const recipient = (over: Partial<PayrollRecipient> = {}): PayrollRecipient => ({
  id: "3f2a7b1c-0d4e-4a6b-8c9d-1e2f3a4b5c6d",
  name: "Alice",
  category: "employee",
  address: VALID_ADDRESS,
  token: usdc,
  usdQuantity: 250050n,
  tokenQuantity: 1000n,
  ...over,
});

describe("getRecipientErrors", () => {
  it("returns no errors for a fully valid recipient", () => {
    expect(getRecipientErrors(recipient())).toEqual([]);
  });

  it("flags an invalid pay address", () => {
    expect(
      getRecipientErrors(recipient({ address: "not-an-address" }))
    ).toContain("Invalid AnomaPay address");
  });

  it("flags a zero USD amount without also flagging the token amount", () => {
    expect(
      getRecipientErrors(recipient({ usdQuantity: 0n, tokenQuantity: 0n }))
    ).toEqual(["Amount must be greater than zero"]);
  });

  it("flags an unresolved token price once a USD amount exists", () => {
    expect(
      getRecipientErrors(recipient({ usdQuantity: 250050n, tokenQuantity: 0n }))
    ).toContain("Token price unavailable");
  });
});

describe("getInsufficientFundsError", () => {
  it("returns an error when the token amount exceeds the held balance", () => {
    expect(
      getInsufficientFundsError(recipient({ tokenQuantity: 1000n }), 500n, true)
    ).toBe("Insufficient funds");
  });

  it("returns undefined when the held balance covers the amount", () => {
    expect(
      getInsufficientFundsError(
        recipient({ tokenQuantity: 1000n }),
        1000n,
        true
      )
    ).toBeUndefined();
  });

  it("returns undefined while balances are still loading", () => {
    expect(
      getInsufficientFundsError(recipient({ tokenQuantity: 1000n }), 0n, false)
    ).toBeUndefined();
  });

  it("returns undefined when there is no token amount yet", () => {
    expect(
      getInsufficientFundsError(recipient({ tokenQuantity: 0n }), 0n, true)
    ).toBeUndefined();
  });
});
