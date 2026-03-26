[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / toDeadline

# Function: toDeadline()

> **toDeadline**(`expiration`): `bigint`

Defined in: [src/lib/permit2.ts:36](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/permit2.ts#L36)

Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
so this is provided as a convenience function.

## Parameters

### expiration

`number`

## Returns

`bigint`
