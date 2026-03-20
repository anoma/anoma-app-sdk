/**
 * Generate Fee Account — creates a new AnomaPay fee collector account.
 *
 * Generates a random seed, derives the four key pairs, and writes the
 * secret seed to a restricted file (fee-account-seed.txt, mode 600).
 * The public outputs (pay address, public keys) are printed to stdout
 * and are safe to share with the team.
 *
 * After running:
 *   1. Store fee-account-seed.txt in a secrets manager.
 *   2. Delete fee-account-seed.txt from disk.
 *   3. The seed can be used as ANOMAPAY_SEED for the fee-collector scripts.
 *
 * Run with:
 *   npm run fee-account:generate
 */

import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import bs58 from "bs58";
import CRC32 from "crc-32";
import { chmodSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

const seed = randomBytes(32);

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

// Pay address: authority(33) + discovery(33) + encryption(33) + cnk(32) + crc32(4) = 135 bytes
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

// Write the secret seed to a restricted file — never print it to the terminal.
const seedFile = resolve("fee-account-seed.txt");
writeFileSync(seedFile, `${hex(seed)}\n`, { encoding: "utf8", flag: "wx" });
chmodSync(seedFile, 0o600);

console.log("=== SHARE WITH TEAM ===");
console.log("payAddress:            ", payAddress);
console.log("authorityPublicKey:    ", hex(authorityPubKey));
console.log("discoveryPublicKey:    ", hex(discoveryPubKey));
console.log("encryptionPublicKey:   ", hex(encryptionPubKey));
console.log("nullifierKeyCommitment:", hex(nullifierCommitment));

console.log("\n=== SECRET ===");
console.log(`Seed written to: ${seedFile}`);
console.log("Move it to a secrets manager, then delete the file.");
