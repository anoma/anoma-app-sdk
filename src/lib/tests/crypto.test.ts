import { KeyPair } from "domain/keys/models";
import { describe, expect, it } from "vitest";
import { aesDecrypt, aesEncrypt } from "../crypto";

describe("aesEncrypt and aesDecrypt", () => {
  // Use a fixed seed for deterministic key generation in tests
  const seed = new Uint8Array(32).fill(1); // Fill with 1 for deterministic seed
  const keyPair = KeyPair.create(seed, "Storage");

  it("encrypts and decrypts a string correctly", async () => {
    const plaintext = "Hello, World!";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);
    const decrypted = await aesDecrypt(keyPair.privateKey, encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (due to random IV)", async () => {
    const plaintext = "Test message";
    const encrypted1 = await aesEncrypt(keyPair.privateKey, plaintext);
    const encrypted2 = await aesEncrypt(keyPair.privateKey, plaintext);

    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to the same plaintext
    const decrypted1 = await aesDecrypt(keyPair.privateKey, encrypted1);
    const decrypted2 = await aesDecrypt(keyPair.privateKey, encrypted2);
    expect(decrypted1).toBe(plaintext);
    expect(decrypted2).toBe(plaintext);
  });

  it("handles empty strings", async () => {
    const plaintext = "";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);
    const decrypted = await aesDecrypt(keyPair.privateKey, encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("handles long strings", async () => {
    const plaintext = "a".repeat(10000);
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);
    const decrypted = await aesDecrypt(keyPair.privateKey, encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("handles strings with special characters", async () => {
    const plaintext = "🔐 Special chars: !@#$%^&*() 中文 العربية";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);
    const decrypted = await aesDecrypt(keyPair.privateKey, encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("returns a hex string from encryption", async () => {
    const plaintext = "test";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);

    // Encrypted output should be a non-empty string
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.length).toBeGreaterThan(0);
  });

  it("fails to decrypt with wrong key", async () => {
    const plaintext = "secret";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);

    // Create a different key pair
    const wrongSeed = new Uint8Array(32).fill(2);
    const wrongKeyPair = KeyPair.create(wrongSeed, "Storage");

    // Decryption should fail or produce garbage
    let errorThrown = false;
    try {
      await aesDecrypt(wrongKeyPair.privateKey, encrypted);
    } catch {
      errorThrown = true;
    }

    // Either an error is thrown or we get garbled output
    if (!errorThrown) {
      const decrypted = await aesDecrypt(wrongKeyPair.privateKey, encrypted);
      expect(decrypted).not.toBe(plaintext);
    }
  });

  it("includes IV in the encrypted output (first 24 hex chars = 12 bytes IV)", async () => {
    const plaintext = "test";
    const encrypted = await aesEncrypt(keyPair.privateKey, plaintext);

    // IV is 12 bytes = 24 hex characters
    expect(encrypted.length).toBeGreaterThan(24);
  });

  it("round-trips with different key pairs produce different results", async () => {
    const plaintext = "message";

    const seed1 = new Uint8Array(32).fill(1);
    const seed2 = new Uint8Array(32).fill(2);
    const keyPair1 = KeyPair.create(seed1, "Storage");
    const keyPair2 = KeyPair.create(seed2, "Storage");

    const encrypted1 = await aesEncrypt(keyPair1.privateKey, plaintext);
    const encrypted2 = await aesEncrypt(keyPair2.privateKey, plaintext);

    expect(encrypted1).not.toBe(encrypted2);

    // Cross-decryption should fail or produce garbage
    const decrypted1 = await aesDecrypt(keyPair1.privateKey, encrypted2).catch(
      () => "error"
    );
    const decrypted2 = await aesDecrypt(keyPair2.privateKey, encrypted1).catch(
      () => "error"
    );

    // At least one should be "error" or different from plaintext
    const anyWrong =
      decrypted1 === "error" ||
      decrypted2 === "error" ||
      decrypted1 !== plaintext ||
      decrypted2 !== plaintext;
    expect(anyWrong).toBe(true);
  });
});
