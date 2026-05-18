[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / serializeUserKeyring

# Function: serializeUserKeyring()

> **serializeUserKeyring**(`keyring`): `string`

Defined in: [src/domain/keys/services.ts:67](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/services.ts#L67)

Serializes a [UserKeyring](../type-aliases/UserKeyring.md) to a JSON string for session storage persistence.

## Parameters

### keyring

[`UserKeyring`](../type-aliases/UserKeyring.md)

The keyring to serialize

## Returns

`string`

JSON string with hex-encoded key pairs
