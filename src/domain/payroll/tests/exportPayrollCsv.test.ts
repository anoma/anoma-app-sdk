import { encodePayAddress } from "lib/payAddress";
import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { buildPayrollCsvExample, exportPayrollCsv } from "../exportPayrollCsv";
import { importPayrollCsv } from "../importPayrollCsv";
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
  tokenQuantity: 0n,
  ...over,
});

describe("exportPayrollCsv", () => {
  it("emits the import header and formats cents as a dollar string", () => {
    const csv = exportPayrollCsv([recipient()]);
    const [header, line] = csv.trim().split(/\r?\n/);
    expect(header).toBe("uuid;name;category;address;network;token;usd");
    expect(line.startsWith("3f2a7b1c-0d4e-4a6b-8c9d-1e2f3a4b5c6d;Alice;")).toBe(
      true
    );
    expect(line.endsWith(";bsc;USDC;2500.50")).toBe(true);
  });

  it("renders whole-dollar amounts without decimals", () => {
    const csv = exportPayrollCsv([recipient({ usdQuantity: 500000n })]);
    expect(csv.trim().split(/\r?\n/)[1].endsWith(";5000")).toBe(true);
  });

  it("is deterministic: re-exporting the same rows keeps the same uuids", () => {
    const recipients = [recipient()];
    expect(exportPayrollCsv(recipients)).toBe(exportPayrollCsv(recipients));
  });

  it("round-trips through importPayrollCsv, preserving id and amounts", () => {
    const recipients = [
      recipient(),
      recipient({
        id: "9a1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
        name: "Bob; the, builder",
        category: "contractor",
        usdQuantity: 100n,
      }),
    ];

    const result = importPayrollCsv(exportPayrollCsv(recipients), [usdc]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recipients).toHaveLength(2);
    expect(result.recipients.map(r => r.id)).toEqual(recipients.map(r => r.id));
    expect(result.recipients[1].name).toBe("Bob; the, builder");
    expect(result.recipients[0].usdQuantity).toBe(250050n);
    expect(result.recipients[1].usdQuantity).toBe(100n);
    expect(result.recipients[0].token.symbol).toBe("USDC");
  });
});

describe("buildPayrollCsvExample", () => {
  it("produces a file that imports cleanly with blank (optional) uuids", () => {
    const result = importPayrollCsv(buildPayrollCsvExample(), [usdc]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recipients.length).toBeGreaterThan(0);
    // Blank uuid column => a fresh id is generated for each row.
    for (const r of result.recipients) {
      expect(r.id).toMatch(/^[0-9a-f-]{36}$/i);
    }
  });
});
