[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / createUserKeyring

# Function: createUserKeyring()

> **createUserKeyring**(`seed?`): [`UserKeyring`](../type-aliases/UserKeyring.md)

Defined in: [src/domain/keys/services.ts:17](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/services.ts#L17)

Derives all key pairs that make up a user keyring.

## Parameters

### seed?

`Uint8Array`\<`ArrayBuffer`\>

Optional 32-byte seed to deterministically derive the keys

## Returns

[`UserKeyring`](../type-aliases/UserKeyring.md)

Object containing authority, nullifier, discovery, and encryption pairs
