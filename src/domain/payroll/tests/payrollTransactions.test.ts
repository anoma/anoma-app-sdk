import { encryptJson } from "lib/encryptedJson";
import type { Hex } from "viem";
import { describe, expect, it } from "vitest";
import {
  buildTxHashMap,
  decryptPayroll,
  mergeEncryptedRun,
  upsertTransaction,
  type DecryptedPayroll,
  type PayrollTransactionEntry,
} from "../payrollTransactions";
import type { PayrollRecipient } from "../types";

const recipient: PayrollRecipient = {
  id: "r1",
  name: "Alice",
  category: "Engineering",
  address: "anomapay1alice",
  usdQuantity: 10000n,
  tokenQuantity: 12345678901234567890n,
  token: {
    address: "0xtoken",
    decimals: 18,
    name: "USD Coin",
    symbol: "USDC",
    network: "bsc",
    feeEnabled: true,
  },
};

const entry = (txHash: Hex): PayrollTransactionEntry => ({
  txHash,
  recipients: [recipient],
  totals: { tokenTotal: 12345678901234567890n, usdTotal: 10000n },
  fee: { amount: 9876543210n, usd: 1.23 },
});

const randomKey = () => crypto.getRandomValues(new Uint8Array(32));

describe("decryptPayroll", () => {
  it("round-trips bigints, the recipient token object, and tx hashes", async () => {
    const key = randomKey();
    const metadata = { transactions: [entry("0xabc"), entry("0xdef")] };
    const result = await decryptPayroll(key, await encryptJson(key, metadata));
    expect(result).toEqual(metadata);
    const [first] = result.transactions;
    expect(typeof first.recipients[0].tokenQuantity).toBe("bigint");
    expect(first.totals.tokenTotal).toBe(12345678901234567890n);
    expect(first.fee.amount).toBe(9876543210n);
    expect(result.transactions.map(t => t.txHash)).toEqual(["0xabc", "0xdef"]);
    // The recipient's token is an object, not a bigint — must survive intact.
    expect(first.recipients[0].token).toEqual(recipient.token);
    expect(typeof first.fee.usd).toBe("number");
  });

  it("omits fee.usd when it is unknown", async () => {
    const key = randomKey();
    const metadata = {
      transactions: [{ ...entry("0xabc"), fee: { amount: 1n } }],
    };
    const result = await decryptPayroll(key, await encryptJson(key, metadata));
    expect(result.transactions[0].fee.usd).toBeUndefined();
    expect(result.transactions[0].fee.amount).toBe(1n);
  });
});

describe("upsertTransaction", () => {
  it("appends a new transaction", () => {
    const result = upsertTransaction([entry("0xabc")], entry("0xdef"));
    expect(result.map(t => t.txHash)).toEqual(["0xabc", "0xdef"]);
  });

  it("replaces an existing transaction with the same tx hash", () => {
    const updated = { ...entry("0xabc"), fee: { amount: 42n } };
    const result = upsertTransaction([entry("0xabc"), entry("0xdef")], updated);
    expect(result.map(t => t.txHash)).toEqual(["0xdef", "0xabc"]);
    expect(result.find(t => t.txHash === "0xabc")?.fee.amount).toBe(42n);
  });
});

describe("buildTxHashMap", () => {
  const payroll = (id: string, txHashes: Hex[]): DecryptedPayroll => ({
    id,
    transactions: txHashes.map(entry),
  });

  it("maps every tx hash to its owning payroll uuid", () => {
    const map = buildTxHashMap([
      payroll("p1", ["0xaaa", "0xbbb"]),
      payroll("p2", ["0xccc"]),
    ]);
    expect(map.get("0xaaa")).toBe("p1");
    expect(map.get("0xbbb")).toBe("p1");
    expect(map.get("0xccc")).toBe("p2");
    expect(map.size).toBe(3);
  });

  it("returns an empty map for no payrolls", () => {
    expect(buildTxHashMap([]).size).toBe(0);
  });
});

describe("mergeEncryptedRun", () => {
  it("appends to an existing run", async () => {
    const key = randomKey();
    const existing = await encryptJson(key, { transactions: [entry("0xabc")] });
    const result = await decryptPayroll(
      key,
      await mergeEncryptedRun(key, existing, entry("0xdef"))
    );
    expect(result.transactions.map(t => t.txHash)).toEqual(["0xabc", "0xdef"]);
  });

  it("starts a fresh run when there is no existing blob", async () => {
    const key = randomKey();
    const result = await decryptPayroll(
      key,
      await mergeEncryptedRun(key, undefined, entry("0xabc"))
    );
    expect(result.transactions.map(t => t.txHash)).toEqual(["0xabc"]);
  });

  it("throws on an undecryptable existing blob instead of overwriting", async () => {
    const key = randomKey();
    await expect(
      mergeEncryptedRun(key, "not-a-valid-encrypted-blob", entry("0xabc"))
    ).rejects.toThrow();
  });
});
