# Pay Address

A **Pay Address** is the shareable identifier users exchange to send and receive private tokens. It encodes four public keys into a single Base64URL string, much like how an IBAN encodes a bank account number with a checksum.

## Format

The raw bytes are assembled in this fixed order before Base64URL encoding:

| Field | Size (bytes) |
| --- | --- |
| Authority Public Key | 33 |
| Discovery Public Key | 33 |
| Encryption Public Key | 33 |
| Nullifier Key Commitment | 32 |
| CRC32 Checksum | 4 |
| **Total** | **135** |

The result is a 180-character Base64URL string (135 bytes × 4/3, rounded up, no padding).

The CRC32 checksum covers the first 131 bytes and is used to detect transcription errors. It does not provide cryptographic security — its sole purpose is to catch typos.

## Encoding

```ts
import {
  encodePayAddress,
  extractUserPublicKeys,
  createUserKeyring,
} from "@anonma/anomapay-sdk";

const keyring = createUserKeyring();
const publicKeys = extractUserPublicKeys(keyring);

const payAddress: string = encodePayAddress(publicKeys);
```

## Decoding

Decoding validates length and CRC32 before returning the public keys:

```ts
import { decodePayAddress } from "@anonma/anomapay-sdk";

const keys = decodePayAddress(payAddress);
// keys.authorityPublicKey   — Uint8Array (33 bytes)
// keys.discoveryPublicKey   — Uint8Array (33 bytes)
// keys.encryptionPublicKey  — Uint8Array (33 bytes)
// keys.nullifierKeyCommitment — Uint8Array (32 bytes)
```

Throws `Error` if:
- The string is empty or whitespace.
- The decoded byte length is not exactly 135.
- The CRC32 checksum does not match.

## Validation

When you receive a Pay Address from user input, validate it before use:

```ts
import { isValidPayAddress } from "@anonma/anomapay-sdk";

if (!isValidPayAddress(userInput)) {
  // show an error in the UI
}
```

`isValidPayAddress` internally calls `decodePayAddress` and returns `false` instead of throwing.
