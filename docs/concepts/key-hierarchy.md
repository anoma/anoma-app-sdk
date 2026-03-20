# Key Hierarchy

Every user in the Anoma Pay protocol is represented by four cryptographic key pairs. Together they form a **keyring** (`UserKeyring`). Understanding what each key does helps you reason about which parts of the keyring need to be available at runtime and which should be stored securely offline.

## The four key pairs

| Key pair | Type | Role |
| --- | --- | --- |
| `authorityKeyPair` | secp256k1 | Signs action trees to authorize resource consumption |
| `nullifierKeyPair` | custom | Proves the right to nullify (spend) a resource |
| `encryptionKeyPair` | secp256k1 | Derives per-resource encryption keys so only the owner can decrypt their balances |
| `discoveryKeyPair` | secp256k1 | Lets the Indexer route incoming resources to the right user |

### Authority key pair

The authority key pair signs the **action tree** — a Merkle root over the set of resources being consumed and created in a transaction. Without a valid signature from the authority key, the backend will reject the transaction.

```ts
// The public key is embedded in every resource you own,
// so the circuit can verify your authorization signature.
keyring.authorityKeyPair.publicKey  // Uint8Array (33 bytes, compressed secp256k1)
keyring.authorityKeyPair.privateKey // Uint8Array (32 bytes)
```

### Nullifier key pair

The nullifier key pair is unique: its "public key" (`cnk`) is actually the SHA-256 hash of the private key (`nk`). This commitment is baked into each resource at creation time. When spending a resource, the protocol derives a **nullifier** from `nk` — a unique tag that proves consumption without revealing which resource was spent.

```ts
keyring.nullifierKeyPair.nk   // Uint8Array — the private nullifier key
keyring.nullifierKeyPair.cnk  // Uint8Array — SHA256(nk), embedded in resources
```

### Encryption key pair

When a resource is created for you, its payload is encrypted to your encryption public key. The SDK uses this private key to decrypt resource blobs fetched from the Indexer, recovering the token type, amount, and other metadata.

### Discovery key pair

The discovery private key is registered with the Indexer via `IndexerClient.addKeys()`. The Indexer uses the corresponding public key to tag incoming resources so they can be retrieved later using the private key as a lookup token.

## Derivation

All four key pairs are derived from a single 32-byte seed using a PRF (HMAC-SHA256) with separate domain strings:

| Key | Domain string |
| --- | --- |
| Authority | `ANOMA_AUTHORITY_KEY` |
| Nullifier | `ANOMA_NULLIFIER_KEY` |
| Encryption | `ANOMA_STATIC_ENCRYPTION_KEY` |
| Discovery | `ANOMA_STATIC_DISCOVERY_KEY` |

This means a single seed reproducibly derives the entire keyring. Lose the seed and you lose access to your resources.

## Creating a keyring

### Random (new user)

```ts
import { createUserKeyring } from "@anonma/anomapay-sdk";

const keyring = createUserKeyring(); // uses crypto.getRandomValues internally
```

### From a wallet signature (deterministic)

Derive a seed by having the user sign a fixed message with their EVM wallet, then use that signature as input key material (IKM):

```ts
import { createUserKeyringFromIkm } from "@anonma/anomapay-sdk";

// `ikm` is arbitrary bytes you derive from a wallet signature or similar
const ikm: Uint8Array = /* ... */;
const keyring = createUserKeyringFromIkm(ikm);
```

Internally, HKDF-SHA256 is applied to `ikm` with the salt `"anoma-pay:keyring-seed"` to produce the 32-byte seed.

### From a WebAuthn passkey (recommended for browser apps)

The recommended approach for browser applications. The passkey PRF extension produces deterministic output from the device authenticator:

```ts
import { createUserKeyringFromPasskey } from "@anonma/anomapay-sdk";

// credential must have been obtained with the PRF extension enabled
const keyring = createUserKeyringFromPasskey(credential);
```

This throws a descriptive error if the selected passkey provider does not support the WebAuthn PRF extension.

## Extracting public keys

To share your identity with others (e.g. to receive a transfer), extract the public key subset:

```ts
import { extractUserPublicKeys } from "@anonma/anomapay-sdk";

const publicKeys = extractUserPublicKeys(keyring);
// { authorityPublicKey, discoveryPublicKey, encryptionPublicKey, nullifierKeyCommitment }
```

This is what gets encoded into a Pay Address.
