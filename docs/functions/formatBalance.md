[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / formatBalance

# Function: formatBalance()

> **formatBalance**(`amount`, `tokenDenom?`, `decimals?`): `string`

Defined in: [src/lib/utils.ts:41](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L41)

Formats a raw token balance (in its smallest unit) into a human-readable string
with locale-aware thousand separators.

## Parameters

### amount

`bigint`

The raw balance as a bigint (e.g., in wei or smallest denomination).

### tokenDenom?

`number` = `6`

The number of decimal places the token uses. Defaults to 6.

### decimals?

`number` = `2`

Minimum fraction digits to display. Defaults to 2.

## Returns

`string`
