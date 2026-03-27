[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / toDeadline

# Function: toDeadline()

> **toDeadline**(`expiration`): `bigint`

Defined in: [src/lib/permit2.ts:36](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/permit2.ts#L36)

Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
so this is provided as a convenience function.

## Parameters

### expiration

`number`

## Returns

`bigint`
