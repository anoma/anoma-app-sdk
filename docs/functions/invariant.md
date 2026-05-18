[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / invariant

# Function: invariant()

> **invariant**(`condition`, `message`): `asserts condition`

Defined in: [src/lib/utils.ts:207](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L207)

Asserts that a condition is truthy; throws an Error with the given message otherwise.
Acts as a TypeScript type guard via `asserts condition`.

## Parameters

### condition

`any`

The value to check.

### message

`string`

The error message if the assertion fails.

## Returns

`asserts condition`
