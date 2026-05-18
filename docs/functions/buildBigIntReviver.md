[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / buildBigIntReviver

# Function: buildBigIntReviver()

> **buildBigIntReviver**(`keys`): (`key`, `value`) => `unknown`

Defined in: [src/lib/utils.ts:143](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L143)

Builds a JSON reviver that converts string values back to bigints for the specified keys.
Pair with [bigIntReplacer](bigIntReplacer.md) when serializing.

## Parameters

### keys

`string`[]

The JSON property names whose values should be revived as bigints.

## Returns

(`key`, `value`) => `unknown`
