[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / extractNumericValue

# Function: extractNumericValue()

> **extractNumericValue**(`text`, `allowTrailingSeparator?`): `string` \| `null`

Defined in: [src/lib/utils.ts:226](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L226)

Extracts a numeric decimal value from a string that may include a currency suffix.
Accepts plain decimals ("350.50"), values with currency codes ("350USD", "350 USD",
"350.1234 CURRENCY"), and comma-separated decimals ("350,50 EUR").
Normalizes commas to periods for consistent decimal handling.

## Parameters

### text

`string`

### allowTrailingSeparator?

`boolean` = `false`

## Returns

`string` \| `null`

The extracted numeric string, or null if the input is not a valid amount.
