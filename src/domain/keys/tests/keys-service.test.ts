import {
  createUserKeyring,
  createUserKeyringFromIkm,
  deserializeUserKeyring,
  serializeUserKeyring,
} from "domain/keys";
import { generateRandomBytes } from "lib/utils";
import { expect, test } from "vitest";

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

test("should derive deterministic keyring from ikm", () => {
  const ikm = generateRandomBytes(32);
  const keyring1 = createUserKeyringFromIkm(ikm);
  const keyring2 = createUserKeyringFromIkm(ikm);

  expect(keyring1.authorityKeyPair.publicKey).toEqual(
    keyring2.authorityKeyPair.publicKey
  );
  expect(keyring1.authorityKeyPair.privateKey).toEqual(
    keyring2.authorityKeyPair.privateKey
  );
  expect(keyring1.discoveryKeyPair.publicKey).toEqual(
    keyring2.discoveryKeyPair.publicKey
  );
  expect(keyring1.nullifierKeyPair.nk).toEqual(keyring2.nullifierKeyPair.nk);
});

test("should round-trip serialize and deserialize a user keyring", () => {
  const keyring = createUserKeyring();
  const json = serializeUserKeyring(keyring);
  const restored = deserializeUserKeyring(json);

  expect(restored.authorityKeyPair.publicKey).toEqual(
    keyring.authorityKeyPair.publicKey
  );
  expect(restored.authorityKeyPair.privateKey).toEqual(
    keyring.authorityKeyPair.privateKey
  );
  expect(restored.discoveryKeyPair.publicKey).toEqual(
    keyring.discoveryKeyPair.publicKey
  );
  expect(restored.discoveryKeyPair.privateKey).toEqual(
    keyring.discoveryKeyPair.privateKey
  );
  expect(restored.encryptionKeyPair.publicKey).toEqual(
    keyring.encryptionKeyPair.publicKey
  );
  expect(restored.encryptionKeyPair.privateKey).toEqual(
    keyring.encryptionKeyPair.privateKey
  );
  expect(restored.nullifierKeyPair.cnk).toEqual(keyring.nullifierKeyPair.cnk);
  expect(restored.nullifierKeyPair.nk).toEqual(keyring.nullifierKeyPair.nk);
});
