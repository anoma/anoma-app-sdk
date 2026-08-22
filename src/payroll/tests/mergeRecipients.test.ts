import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { mergeRecipientsByUuid } from "../mergeRecipients";
import type { PayrollRecipient } from "../types";

const usdc: TokenRegistry = {
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  decimals: 18,
  name: "USD Coin",
  symbol: "USDC",
  network: "bsc",
  feeEnabled: true,
};

const recipient = (id: string, name: string): PayrollRecipient => ({
  id,
  name,
  category: "employee",
  address: "addr",
  token: usdc,
  usdQuantity: 100n,
  tokenQuantity: 0n,
});

describe("mergeRecipientsByUuid", () => {
  it("updates matching ids in place and appends new ones, keeping order", () => {
    const current = [recipient("a", "Alice"), recipient("b", "Bob")];
    const incoming = [recipient("b", "Bobby"), recipient("c", "Carol")];
    const merged = mergeRecipientsByUuid(current, incoming);
    expect(merged.map(r => [r.id, r.name])).toEqual([
      ["a", "Alice"],
      ["b", "Bobby"],
      ["c", "Carol"],
    ]);
  });

  it("keeps current recipients with no incoming match", () => {
    const current = [recipient("a", "Alice")];
    const merged = mergeRecipientsByUuid(current, []);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("a");
  });
});
