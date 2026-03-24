import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import type { Address } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createUserKeyring,
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "..";
import {
  authorityKeyPair,
  nullifierKeyPair,
  seed,
  serializedKeyPair,
  serializedNullifierKeyPair,
  staticDiscoverKeyPair,
  staticEncryptionKeyPair,
} from "../../../../tests/data.json";
import { fromBase64, fromHex, toHex } from "../../../lib/utils";

describe("Key functions", () => {
  beforeAll(() => {
    // Register hashes for secp256k1.sign()
    secp256k1.hashes.sha256 = sha256;
    secp256k1.hashes.hmacSha256 = (key: Uint8Array, msg: Uint8Array) =>
      hmac(sha256, key, msg);
  });

  it("Can recreate a keyring", () => {
    const seedBytes = fromBase64(seed);
    const keyring = createUserKeyring(seedBytes);

    expect(keyring.authorityKeyPair).toBeInstanceOf(KeyPair);
    expect(keyring.discoveryKeyPair).toBeInstanceOf(KeyPair);
    expect(keyring.encryptionKeyPair).toBeInstanceOf(KeyPair);
    expect(keyring.nullifierKeyPair).toBeInstanceOf(NullifierKeyPair);

    // Authority Keypair
    expect(toHex(keyring.authorityKeyPair.privateKey)).toBe(
      authorityKeyPair.privateKey
    );
    expect(toHex(keyring.authorityKeyPair.publicKey)).toBe(
      authorityKeyPair.publicKey
    );

    // Discovery Keypair
    expect(toHex(keyring.discoveryKeyPair.privateKey)).toBe(
      staticDiscoverKeyPair.privateKey
    );

    expect(toHex(keyring.discoveryKeyPair.publicKey)).toBe(
      staticDiscoverKeyPair.publicKey
    );

    // Encryption Keypair
    expect(toHex(keyring.encryptionKeyPair.privateKey)).toBe(
      staticEncryptionKeyPair.privateKey
    );

    expect(toHex(keyring.encryptionKeyPair.publicKey)).toBe(
      staticEncryptionKeyPair.publicKey
    );

    // NullifierKeyPair
    expect(toHex(keyring.nullifierKeyPair.nk)).toBe(nullifierKeyPair.nk);
    expect(toHex(keyring.nullifierKeyPair.cnk)).toBe(nullifierKeyPair.cnk);
  });

  it("Can serialize KeyPair", () => {
    const keyring = createUserKeyring(fromBase64(seed));
    const json = KeyPairSerializer.toJson(keyring.authorityKeyPair);
    expect(json).toBe(serializedKeyPair);
  });

  it("Can serialize NullifierKeyPair", () => {
    const keyring = createUserKeyring(fromBase64(seed));
    const json = KeyPairSerializer.toJson(keyring.nullifierKeyPair);
    expect(json).toBe(serializedNullifierKeyPair);
  });

  it("Can deserialize JSON to KeyPair", () => {
    const restoredKeypair = KeyPairSerializer.fromJson(
      KeyPair,
      serializedKeyPair
    );
    expect(JSON.parse(KeyPairSerializer.toJson(restoredKeypair))).toEqual(
      authorityKeyPair
    );
    expect(restoredKeypair.privateKey).toEqual(
      fromHex(authorityKeyPair.privateKey as Address)
    );
  });

  it("Can deserialize JSON to NullifierKeyPair", () => {
    const restoredNullifierKeyPair = KeyPairSerializer.fromJson(
      NullifierKeyPair,
      serializedNullifierKeyPair
    );
    expect(restoredNullifierKeyPair.nk).toEqual(
      fromHex(nullifierKeyPair.nk as Address)
    );
    expect(restoredNullifierKeyPair.cnk).toEqual(
      fromHex(nullifierKeyPair.cnk as Address)
    );
  });
});
