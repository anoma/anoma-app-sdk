[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / getPermit2Data

# Function: getPermit2Data()

> **getPermit2Data**(`props`): `PermitTransferFromData`

Defined in: [src/lib/permit2.ts:46](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/permit2.ts#L46)

Builds the typed data payload used by Permit2 to authorize transfers.

## Parameters

### props

[`Permit2Props`](../type-aliases/Permit2Props.md)

Permit parameters such as token, amount, witness root, and deadline.

## Returns

`PermitTransferFromData`

The domain, type definitions, and message values for signing.
