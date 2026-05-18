[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / toDeadline

# Function: toDeadline()

> **toDeadline**(`expiration`): `bigint`

Defined in: [src/lib/permit2.ts:47](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/permit2.ts#L47)

Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
so this is provided as a convenience function.

## Parameters

### expiration

`number`

## Returns

`bigint`
