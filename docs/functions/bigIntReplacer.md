[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / bigIntReplacer

# Function: bigIntReplacer()

> **bigIntReplacer**(`_key`, `value`): `unknown`

Defined in: [src/lib/utils.ts:134](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L134)

JSON replacer that serializes bigint values as strings for lossless encoding.
Pair with [buildBigIntReviver](buildBigIntReviver.md) when deserializing.

## Parameters

### \_key

`string`

### value

`unknown`

## Returns

`unknown`
