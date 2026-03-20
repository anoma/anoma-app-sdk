/**
 * Verify Fee Account — re-derives the pay address and public keys from a seed.
 *
 * Use this to confirm that a stored seed still produces the expected public
 * outputs without regenerating a new account.
 *
 * Run with:
 *   npm run fee-account:verify -- <64-char hex seed>
 */

import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import bs58 from "bs58";
import CRC32 from "crc-32";

const seedHex = process.argv[2];
if (!seedHex || !/^[0-9a-f]{64}$/i.test(seedHex)) {
  console.error("Usage: npm run fee-account:verify -- <64-char hex seed>");
  process.exit(1);
}

const seed = Buffer.from(seedHex, "hex");

const derivePrivKey = (domain: string) =>
  hmac(sha256, seed, new TextEncoder().encode(domain)) as Uint8Array<ArrayBuffer>;

const authorityPrivKey  = derivePrivKey("ANOMA_AUTHORITY_KEY");
const encryptionPrivKey = derivePrivKey("ANOMA_STATIC_ENCRYPTION_KEY");
const discoveryPrivKey  = derivePrivKey("ANOMA_STATIC_DISCOVERY_KEY");
const nullifierPrivKey  = derivePrivKey("ANOMA_NULLIFIER_KEY");

const authorityPubKey     = secp256k1.getPublicKey(authorityPrivKey, true);
const encryptionPubKey    = secp256k1.getPublicKey(encryptionPrivKey, true);
const discoveryPubKey     = secp256k1.getPublicKey(discoveryPrivKey, true);
const nullifierCommitment = sha256(nullifierPrivKey);

const keyBytes = new Uint8Array([
  ...authorityPubKey,
  ...discoveryPubKey,
  ...encryptionPubKey,
  ...nullifierCommitment,
]);
const crc = CRC32.buf(keyBytes) >>> 0;
const crcBytes = new Uint8Array(4);
new DataView(crcBytes.buffer).setUint32(0, crc);
const payAddress = bs58.encode(new Uint8Array([...keyBytes, ...crcBytes]));

const hex = (b: Uint8Array) => Buffer.from(b).toString("hex");

console.log("\n=== DERIVED FROM SEED ===");
console.log("payAddress:            ", payAddress);
console.log("authorityPublicKey:    ", hex(authorityPubKey));
console.log("discoveryPublicKey:    ", hex(discoveryPubKey));
console.log("encryptionPublicKey:   ", hex(encryptionPubKey));
console.log("nullifierKeyCommitment:", hex(nullifierCommitment));
