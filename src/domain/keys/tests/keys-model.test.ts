import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import {
  createUserKeyring,
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys";
import { fromBase64, fromHex, toHex } from "lib/utils";
import type { Hex } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import {
  authorityKeyPair,
  nullifierKeyPair,
  seed,
  serializedKeyPair,
  serializedNullifierKeyPair,
  staticDiscoverKeyPair,
  staticEncryptionKeyPair,
} from "./data.json";

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
    expect(authorityKeyPair.ask).toBe(
      toHex(keyring.authorityKeyPair.privateKey)
    );
    expect(authorityKeyPair.apk).toBe(
      toHex(keyring.authorityKeyPair.publicKey)
    );

    // Discovery Keypair
    expect(staticDiscoverKeyPair.sdsk).toBe(
      toHex(keyring.discoveryKeyPair.privateKey)
    );
    expect(staticDiscoverKeyPair.sdpk).toBe(
      toHex(keyring.discoveryKeyPair.publicKey)
    );

    // Encryption Keypair
    expect(staticEncryptionKeyPair.sesk).toBe(
      toHex(keyring.encryptionKeyPair.privateKey)
    );
    expect(staticEncryptionKeyPair.sepk).toBe(
      toHex(keyring.encryptionKeyPair.publicKey)
    );

    // NullifierKeyPair
    expect(nullifierKeyPair.nk).toBe(toHex(keyring.nullifierKeyPair.nk));
    expect(nullifierKeyPair.cnk).toBe(toHex(keyring.nullifierKeyPair.cnk));
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
    expect(fromHex(authorityKeyPair.apk as Hex)).toEqual(
      restoredKeypair.publicKey
    );
    expect(fromHex(authorityKeyPair.ask as Hex)).toEqual(
      restoredKeypair.privateKey
    );
  });

  it("Can deserialize JSON to NullifierKeyPair", () => {
    const restoredNullifierKeyPair = KeyPairSerializer.fromJson(
      NullifierKeyPair,
      serializedNullifierKeyPair
    );
    expect(fromHex(nullifierKeyPair.nk as Hex)).toEqual(
      restoredNullifierKeyPair.nk
    );
    expect(fromHex(nullifierKeyPair.cnk as Hex)).toEqual(
      restoredNullifierKeyPair.cnk
    );
  });
});
