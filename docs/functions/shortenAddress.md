[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / shortenAddress

# Function: shortenAddress()

> **shortenAddress**(`address`, `head?`, `tail?`): `string`

Defined in: [src/lib/utils.ts:20](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L20)

Truncates an address to show only the first and last few characters,
separated by an ellipsis (e.g., "0x1234ab…cdef").

## Parameters

### address

`string`

The full address string.

### head?

`number` = `6`

Number of characters to keep after the "0x" prefix. Defaults to 6.

### tail?

`number` = `4`

Number of characters to keep at the end. Defaults to 4.

## Returns

`string`
