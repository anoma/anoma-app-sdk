[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / convertObjectToSnakeCase

# Function: convertObjectToSnakeCase()

> **convertObjectToSnakeCase**(`obj`): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/utils.ts:184](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L184)

Converts an object's camelCase keys to snake_case.
Only transforms top-level keys; nested objects are not recursed.

## Parameters

### obj

`object`

The object whose keys should be converted.

## Returns

`Record`\<`string`, `unknown`\>
