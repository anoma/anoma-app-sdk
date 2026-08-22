import { describe, expect, it } from "vitest";
import { aesDecrypt, aesEncrypt } from "../crypto";
import { fromHex } from "../utils";
import fixtures from "./crypto-fixtures.json";

// These ciphertexts were produced by the previous WebCrypto (`crypto.subtle`)
// implementation. They stand in for payloads already sitting in users' vaults:
// if this fails, an SDK upgrade silently locks people out of their data.
describe("aesDecrypt reads WebCrypto-era ciphertexts", () => {
  it.each(fixtures.cases.map((c, i) => [i, c] as const))(
    "case %i",
    async (_i, c) => {
      const key = fromHex(`0x${c.privateKey}`);
      expect(await aesDecrypt(key, c.encrypted)).toBe(c.plaintext);
    }
  );

  it("still round-trips its own output", async () => {
    const key = fromHex(`0x${fixtures.cases[0].privateKey}`);
    const encrypted = await aesEncrypt(key, "round trip");
    expect(await aesDecrypt(key, encrypted)).toBe("round trip");
  });
});
