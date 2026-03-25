# Quick Start

This page shows the minimum code needed to get the three most common operations working: generating a keyring, producing a Pay Address, and validating one.

## 1. Generate a keyring

A keyring holds the four cryptographic key pairs that identify a user on the Anoma Pay protocol. Generate a fresh random one with:

```ts
import { createUserKeyring } from "@anonma/anomapay-sdk";

const keyring = createUserKeyring();
```

For deterministic derivation — for example, from a wallet signature or a passkey PRF output — pass a 32-byte seed:

```ts
import { createUserKeyring } from "@anonma/anomapay-sdk";

const seed: Uint8Array = /* 32 bytes from your source of entropy */;
const keyring = createUserKeyring(seed);
```

See [Key Hierarchy](/concepts/key-hierarchy) for full details on each key type.

## 2. Produce a Pay Address

A Pay Address encodes a user's four public keys into a single shareable string. Other users send tokens to this address.

```ts
import {
  createUserKeyring,
  encodePayAddress,
  extractUserPublicKeys,
} from "@anonma/anomapay-sdk";

const keyring = createUserKeyring();
const publicKeys = extractUserPublicKeys(keyring);
const payAddress = encodePayAddress(publicKeys);

console.log(payAddress);
// "AP1qpSq6..." (Base64URL-encoded, 180 characters)
```

## 3. Validate and decode a Pay Address

Before sending tokens, validate that an address string is well-formed:

```ts
import { isValidPayAddress, decodePayAddress } from "@anonma/anomapay-sdk";

const raw = "AP1qpSq6...";

if (isValidPayAddress(raw)) {
  const receiverKeys = decodePayAddress(raw);
  // receiverKeys.authorityPublicKey, .discoveryPublicKey, etc.
}
```

`decodePayAddress` throws if the address is malformed or if its CRC32 checksum fails. Use `isValidPayAddress` when you want a boolean check without throwing.

## 4. Persist and restore a keyring

Keyrings should be persisted across sessions. Serialize to a JSON string for storage (e.g. `sessionStorage`, an encrypted vault, or `localStorage`):

```ts
import {
  serializeUserKeyring,
  deserializeUserKeyring,
} from "@anonma/anomapay-sdk";

// Save
const json = serializeUserKeyring(keyring);
sessionStorage.setItem("keyring", json);

// Restore
const stored = sessionStorage.getItem("keyring");
if (stored) {
  const restored = deserializeUserKeyring(stored);
}
```

::: warning
The serialized keyring contains private key material. Store it only in secure, user-controlled storage and never transmit it.
:::

## Next steps

- Follow the [Private Transfer App guide](/guides/private-transfer-app) for a complete end-to-end integration.
- Read [Concepts → Transfers](/concepts/transfers) to understand mint, transfer, and burn operations.
- Browse the [API Reference](/api/) for all exported types and functions.
