[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / getPermit2Data

# Function: getPermit2Data()

> **getPermit2Data**(`props`): `PermitTransferFromData`

Defined in: [src/lib/permit2.ts:57](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/permit2.ts#L57)

Builds the typed data payload used by Permit2 to authorize transfers.

## Parameters

### props

[`Permit2Props`](../type-aliases/Permit2Props.md)

Permit parameters such as token, amount, witness root, and deadline.

## Returns

`PermitTransferFromData`

The domain, type definitions, and message values for signing.
