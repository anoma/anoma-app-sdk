// Derives and prints a full user keyring from a hex seed (IKM).
// Each run with the same seed produces the same deterministic keys.
// If no seed is provided, a random one is generated.
//
// Usage: npx tsx --tsconfig tsconfig.scripts.json scripts/create-account.ts [seed-hex]
// Example: npx tsx --tsconfig tsconfig.scripts.json scripts/create-account.ts 0xdeadbeef

import { randomBytes } from "crypto";
import { createUserKeyringFromIkm, toUserKeyringJson } from "domain/keys";
import { getPayAddressFromKeyring } from "lib/keyUtils";
import { fromHex, toHex } from "lib/utils";
import { isHex } from "viem";

const seedHex = process.argv[2];
const resolvedSeedHex =
  seedHex ?
    isHex(seedHex) ? seedHex
    : (`0x${seedHex}` as `0x${string}`)
  : (toHex(randomBytes(32)) as `0x${string}`);

const ikm = fromHex(resolvedSeedHex);
const keyring = createUserKeyringFromIkm(ikm);
const keyringJson = toUserKeyringJson(keyring);
const payAddress = getPayAddressFromKeyring(keyring);

console.log(
  JSON.stringify(
    {
      seed: resolvedSeedHex,
      payAddress,
      keyring: keyringJson,
    },
    null,
    2
  )
);
