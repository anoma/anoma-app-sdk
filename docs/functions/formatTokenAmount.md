[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / formatTokenAmount

# Function: formatTokenAmount()

> **formatTokenAmount**(`amount`, `token`, `maxDecimals?`, `hideSymbol?`): `string`

Defined in: [src/lib/utils.ts:285](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L285)

Format a token amount for display, limiting to MAX_DECIMALS decimal places.
Very small numbers (where the first non-zero digit is beyond MAX_DECIMALS)
are preserved in full to avoid displaying "0.000000".
Uses string-based rounding to avoid floating-point precision loss.

## Parameters

### amount

`string`

The amount as a string

### token

[`TokenRegistry`](../type-aliases/TokenRegistry.md)

The token registry entry

### maxDecimals?

`number` = `6`

### hideSymbol?

`boolean` = `false`

## Returns

`string`

Formatted string (e.g., "0.123457 USDC", "0.000000000001 USDC")
