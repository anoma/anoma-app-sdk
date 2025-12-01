import { expect, test } from "vitest";
import { createVaultAccount, unlockVault } from "domain/crypto";
import { createUserKeyring } from "domain/keys";
import { generateRandomBytes } from "lib/utils";
import { VAULT_VERSION } from "app-constants";

test("should create user keyring correctly", () => {
  const keyring = createUserKeyring();

  expect(keyring.authorityKeyPair.publicKey).toBeInstanceOf(Uint8Array);
  expect(keyring.authorityKeyPair.privateKey).toBeInstanceOf(Uint8Array);

  expect(keyring.discoveryKeyPair.publicKey).toBeInstanceOf(Uint8Array);
  expect(keyring.discoveryKeyPair.privateKey).toBeInstanceOf(Uint8Array);

  expect(keyring.encryptionKeyPair.publicKey).toBeInstanceOf(Uint8Array);
  expect(keyring.encryptionKeyPair.privateKey).toBeInstanceOf(Uint8Array);

  expect(keyring.nullifierKeyPair.cnk).toBeInstanceOf(Uint8Array);
  expect(keyring.nullifierKeyPair.nk).toBeInstanceOf(Uint8Array);
});

test("should encrypt and decrypt user vault correctly", async () => {
  const keyring = createUserKeyring();
  const fakeSignature = generateRandomBytes(18);
  const walletAddress = "0xA707526e8DF54A7658bD4c19C1db46D6DA2F5157";
  const vault = await createVaultAccount(walletAddress, keyring, fakeSignature);

  // Checking if vault was created correclty
  expect(vault.id).toBe(walletAddress);
  // expect(vault.ciphertext).toBeInstanceOf(ArrayBuffer);
  expect(vault.ciphertext.byteLength).toBeGreaterThan(0);
  expect(vault.version).toBe(VAULT_VERSION);
  expect(vault.iv.length).toBeGreaterThan(0);
  expect(vault.createdAt).toBeLessThanOrEqual(Date.now());
  expect(vault.modifiedAt).toBeLessThanOrEqual(Date.now());

  const decryptedKeyring = await unlockVault(vault, fakeSignature);
  expect(decryptedKeyring.authorityKeyPair.publicKey).toEqual(
    keyring.authorityKeyPair.publicKey
  );

  expect(decryptedKeyring.authorityKeyPair.privateKey).toEqual(
    keyring.authorityKeyPair.privateKey
  );

  expect(decryptedKeyring.discoveryKeyPair.publicKey).toEqual(
    keyring.discoveryKeyPair.publicKey
  );

  expect(decryptedKeyring.discoveryKeyPair.privateKey).toEqual(
    keyring.discoveryKeyPair.privateKey
  );

  expect(decryptedKeyring.encryptionKeyPair.publicKey).toEqual(
    keyring.encryptionKeyPair.publicKey
  );

  expect(decryptedKeyring.encryptionKeyPair.privateKey).toEqual(
    keyring.encryptionKeyPair.privateKey
  );

  expect(decryptedKeyring.nullifierKeyPair.cnk).toEqual(
    keyring.nullifierKeyPair.cnk
  );

  expect(decryptedKeyring.nullifierKeyPair.nk).toEqual(
    keyring.nullifierKeyPair.nk
  );
});
