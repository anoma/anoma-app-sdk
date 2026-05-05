// Derives and prints a full user keyring from a hex seed (IKM).
// Each run with the same seed produces the same deterministic keys.
//
// Usage: npx tsx --tsconfig tsconfig.scripts.json scripts/create-account.ts <seed-hex>
// Example: npx tsx --tsconfig tsconfig.scripts.json scripts/create-account.ts 0xdeadbeef

import { createUserKeyringFromIkm, toUserKeyringJson } from "domain/keys";
import { getPayAddressFromKeyring } from "lib/keyUtils";
import { fromHex } from "lib/utils";
import { isHex } from "viem";

const seedHex = process.argv[2];
if (!seedHex) {
  console.error(
    "Usage: npx tsx --tsconfig tsconfig.scripts.json scripts/create-account.ts <seed-hex>"
  );
  process.exit(1);
}

const ikm = fromHex(isHex(seedHex) ? seedHex : `0x${seedHex}`);
const keyring = createUserKeyringFromIkm(ikm);
const keyringJson = toUserKeyringJson(keyring);
const payAddress = getPayAddressFromKeyring(keyring);

console.log(
  JSON.stringify(
    {
      keyring: keyringJson,
      payAddress,
    },
    null,
    2
  )
);
