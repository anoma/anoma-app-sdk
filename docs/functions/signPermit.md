[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / signPermit

# Function: signPermit()

> **signPermit**(`signTypedData`, `props`, `ownerAddress`): `Promise`\<[`PermitSignature`](../type-aliases/PermitSignature.md)\>

Defined in: [src/lib/permit2.ts:107](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/permit2.ts#L107)

Signs the Permit2 typed data for a given owner and props.

## Parameters

### signTypedData

`SignTypedDataFn`

### props

[`Permit2Props`](../type-aliases/Permit2Props.md)

Permit parameters describing the token, witness, and deadlines.

### ownerAddress

`` `0x${string}` ``

Address whose private key authorizes the permit.

## Returns

`Promise`\<[`PermitSignature`](../type-aliases/PermitSignature.md)\>

Split signature along with the original signature hex string.
