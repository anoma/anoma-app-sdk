[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / roundDecimalString

# Function: roundDecimalString()

> **roundDecimalString**(`amount`, `maxDecimals?`): `string`

Defined in: [src/lib/utils.ts:258](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L258)

Round a decimal string to a given number of decimal places using string
arithmetic. Avoids floating-point precision loss from parseFloat/toFixed.

## Parameters

### amount

`string`

The decimal string to round

### maxDecimals?

`number` = `6`

Maximum decimal places to keep

## Returns

`string`

The rounded decimal string
