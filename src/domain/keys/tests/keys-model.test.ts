import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import {
  KeyDerivation,
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys";
import { fromBase64, fromHex, toHex } from "lib/utils";
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

  it("Can recreate an Identity Keypair", () => {
    const seedBytes = fromBase64(seed);
    const derivedAuthorityKeyPair =
      KeyDerivation.deriveAuthorityKeyPair(seedBytes);
    const { publicKey, privateKey } = derivedAuthorityKeyPair;

    expect(derivedAuthorityKeyPair).toBeInstanceOf(KeyPair);
    expect(authorityKeyPair.ask).toBe(toHex(privateKey));
    expect(authorityKeyPair.apk).toBe(toHex(publicKey));
  });

  it("Can recreate Nullifier Key and Nullifier Key Commitment", () => {
    const seedBytes = fromBase64(seed);
    const derivedNullifierKeyPair =
      KeyDerivation.deriveNullifierKeyPair(seedBytes);
    const { nk, cnk } = derivedNullifierKeyPair;

    expect(derivedNullifierKeyPair).toBeInstanceOf(NullifierKeyPair);
    expect(nullifierKeyPair.nk).toBe(toHex(nk));
    expect(nullifierKeyPair.cnk).toBe(toHex(cnk));
  });

  it("Can recreate a Static Encryption Keypair", () => {
    const seedBytes = fromBase64(seed);
    const derivedEncryptionKeyPair =
      KeyDerivation.deriveStaticEncryptionKeyPair(seedBytes);
    const { publicKey, privateKey } = derivedEncryptionKeyPair;

    expect(derivedEncryptionKeyPair).toBeInstanceOf(KeyPair);
    expect(staticEncryptionKeyPair.sesk).toBe(toHex(privateKey));
    expect(staticEncryptionKeyPair.sepk).toBe(toHex(publicKey));
  });

  it("Can recreate a Static Discovery Keypair", () => {
    const seedBytes = fromBase64(seed);
    const derivedDiscoveryKeyPair =
      KeyDerivation.deriveStaticDiscoveryKeyPair(seedBytes);
    const { publicKey, privateKey } = derivedDiscoveryKeyPair;

    expect(derivedDiscoveryKeyPair).toBeInstanceOf(KeyPair);
    expect(staticDiscoverKeyPair.sdsk).toBe(toHex(privateKey));
    expect(staticDiscoverKeyPair.sdpk).toBe(toHex(publicKey));
  });

  it("Can serialize KeyPair", () => {
    const keypair = KeyDerivation.deriveAuthorityKeyPair(fromBase64(seed));
    const json = KeyPairSerializer.toJson(keypair);

    expect(json).toBe(serializedKeyPair);
  });

  it("Can serialize NullifierKeyPair", () => {
    const nullifierKeyPair = KeyDerivation.deriveNullifierKeyPair(
      fromBase64(seed)
    );
    const json = KeyPairSerializer.toJson(nullifierKeyPair);
    expect(json).toBe(serializedNullifierKeyPair);
  });

  it("Can deserialize JSON to KeyPair", () => {
    const restoredKeypair = KeyPairSerializer.fromJson(
      KeyPair,
      serializedKeyPair
    );
    expect(fromHex(authorityKeyPair.apk)).toEqual(restoredKeypair.publicKey);
    expect(fromHex(authorityKeyPair.ask)).toEqual(restoredKeypair.privateKey);
  });

  it("Can deserialize JSON to NullifierKeyPair", () => {
    const restoredNullifierKeyPair = KeyPairSerializer.fromJson(
      NullifierKeyPair,
      serializedNullifierKeyPair
    );
    expect(fromHex(nullifierKeyPair.nk)).toEqual(restoredNullifierKeyPair.nk);
    expect(fromHex(nullifierKeyPair.cnk)).toEqual(restoredNullifierKeyPair.cnk);
  });
});
