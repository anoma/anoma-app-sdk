import { encodePayAddress } from "lib/payAddress";
import type { TokenRegistry } from "types";
import { describe, expect, it } from "vitest";
import { importPayrollCsv } from "../importPayrollCsv";

// A real, decodable AnomaPay address built from zero-byte keys (valid lengths + CRC).
const VALID_ADDRESS = encodePayAddress({
  authorityPublicKey: new Uint8Array(33),
  discoveryPublicKey: new Uint8Array(33),
  encryptionPublicKey: new Uint8Array(33),
  nullifierKeyCommitment: new Uint8Array(32),
});

const TOKENS: TokenRegistry[] = [
  {
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    decimals: 18,
    name: "USD Coin",
    symbol: "USDC",
    network: "bsc",
    feeEnabled: true,
  },
  {
    address: "0x55d398326f99059ff775485246999027b3197955",
    decimals: 18,
    name: "Tether USD",
    symbol: "USDT",
    network: "ethereum",
    feeEnabled: true,
  },
];

const header = "uuid;name;category;address;network;token;usd";
const row = (over: Partial<Record<string, string>> = {}) => {
  const f = {
    uuid: "",
    name: "Alice",
    category: "employee",
    address: VALID_ADDRESS,
    network: "bsc",
    token: "usdc",
    usd: "5000",
    ...over,
  };
  return `${f.uuid};${f.name};${f.category};${f.address};${f.network};${f.token};${f.usd}`;
};

describe("importPayrollCsv", () => {
  it("parses a valid file, resolving token and USD cents, generating uuid", () => {
    const result = importPayrollCsv(`${header}\n${row()}`, TOKENS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recipients).toHaveLength(1);
    const r = result.recipients[0];
    expect(r.name).toBe("Alice");
    expect(r.token.symbol).toBe("USDC");
    expect(r.usdQuantity).toBe(500000n); // $5000.00
    expect(r.id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("carries a provided uuid into the recipient id", () => {
    const uuid = "3f2a7b1c-0d4e-4a6b-8c9d-1e2f3a4b5c6d";
    const result = importPayrollCsv(`${header}\n${row({ uuid })}`, TOKENS);
    expect(result.ok && result.recipients[0].id).toBe(uuid);
  });

  it("imports a CSV that omits the optional uuid column", () => {
    const noUuidHeader = "name;category;address;network;token;usd";
    const noUuidRow = `Alice;employee;${VALID_ADDRESS};bsc;usdc;5000`;
    const result = importPayrollCsv(`${noUuidHeader}\n${noUuidRow}`, TOKENS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recipients).toHaveLength(1);
    expect(result.recipients[0].id).toMatch(/^[0-9a-f-]{36}$/i); // generated
  });

  it("rejects a malformed uuid", () => {
    const result = importPayrollCsv(
      `${header}\n${row({ uuid: "not-a-uuid" })}`,
      TOKENS
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatchObject({ row: 1, column: "uuid" });
  });

  it("parses USD with up to two decimals as cents", () => {
    const result = importPayrollCsv(
      `${header}\n${row({ usd: "2500.50" })}`,
      TOKENS
    );
    expect(result.ok && result.recipients[0].usdQuantity).toBe(250050n);
  });

  it("matches network and token case-insensitively", () => {
    const result = importPayrollCsv(
      `${header}\n${row({ network: "BSC", token: "USDC" })}`,
      TOKENS
    );
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid address", () => {
    const result = importPayrollCsv(
      `${header}\n${row({ address: "not-an-address" })}`,
      TOKENS
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatchObject({ row: 1, column: "address" });
  });

  it("rejects an unsupported network", () => {
    const result = importPayrollCsv(
      `${header}\n${row({ network: "dogechain" })}`,
      TOKENS
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some(e => e.column === "network")).toBe(true);
  });

  it("rejects a token not available on the given network", () => {
    // USDT exists, but on ethereum, not bsc
    const result = importPayrollCsv(
      `${header}\n${row({ token: "usdt" })}`,
      TOKENS
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some(e => e.column === "token")).toBe(true);
  });

  it("rejects invalid USD values", () => {
    for (const usd of ["-5", "abc", "10.999", "0"]) {
      const result = importPayrollCsv(`${header}\n${row({ usd })}`, TOKENS);
      expect(result.ok, `usd=${usd}`).toBe(false);
    }
  });

  it("rejects XSS / formula injection in free-text fields", () => {
    const xss = importPayrollCsv(
      `${header}\n${row({ name: "<b>x</b>" })}`,
      TOKENS
    );
    expect(xss.ok).toBe(false);
    const formula = importPayrollCsv(
      `${header}\n${row({ category: "=cmd" })}`,
      TOKENS
    );
    expect(formula.ok).toBe(false);
  });

  it("rejects a duplicate uuid within the file", () => {
    const uuid = "3f2a7b1c-0d4e-4a6b-8c9d-1e2f3a4b5c6d";
    const body = `${row({ uuid })}\n${row({ uuid })}`;
    const result = importPayrollCsv(`${header}\n${body}`, TOKENS);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.errors.some(e => e.message.toLowerCase().includes("duplicate"))
    ).toBe(true);
  });

  it("rejects a missing required column", () => {
    const missing = importPayrollCsv(
      `uuid;name;category;address;network;token\n;Alice;employee;${VALID_ADDRESS};bsc;usdc`,
      TOKENS
    );
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.errors[0].message).toMatch(/missing required column/i);
  });

  it("rejects an unknown extra column", () => {
    const result = importPayrollCsv(`${header};bonus\n${row()};999`, TOKENS);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/unknown column/i);
  });

  it("rejects a file with no data rows", () => {
    const result = importPayrollCsv(header, TOKENS);
    expect(result.ok).toBe(false);
  });

  it("collects errors from every invalid row", () => {
    const body = [row({ address: "bad" }), row({ usd: "abc" })].join("\n");
    const result = importPayrollCsv(`${header}\n${body}`, TOKENS);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("parses quoted fields containing the delimiter and escaped quotes", () => {
    const name = '"Smith; Jr ""The Boss"""';
    const result = importPayrollCsv(`${header}\n${row({ name })}`, TOKENS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recipients[0].name).toBe('Smith; Jr "The Boss"');
  });
});
