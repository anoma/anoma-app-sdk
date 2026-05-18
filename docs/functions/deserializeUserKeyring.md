[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / deserializeUserKeyring

# Function: deserializeUserKeyring()

> **deserializeUserKeyring**(`json`): [`UserKeyring`](../type-aliases/UserKeyring.md)

Defined in: [src/domain/keys/services.ts:81](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/services.ts#L81)

Deserializes a [UserKeyring](../type-aliases/UserKeyring.md) from a JSON string produced by [serializeUserKeyring](serializeUserKeyring.md).

## Parameters

### json

`string`

JSON string with hex-encoded key pairs

## Returns

[`UserKeyring`](../type-aliases/UserKeyring.md)

Restored [UserKeyring](../type-aliases/UserKeyring.md)
