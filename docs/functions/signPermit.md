[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / signPermit

# Function: signPermit()

> **signPermit**(`signTypedData`, `props`, `ownerAddress`): `Promise`\<[`PermitSignature`](../type-aliases/PermitSignature.md)\>

Defined in: [src/lib/permit2.ts:96](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/permit2.ts#L96)

Signs the Permit2 typed data for a given owner and props.

## Parameters

### signTypedData

`SignTypedDataMutateAsync`

### props

[`Permit2Props`](../type-aliases/Permit2Props.md)

Permit parameters describing the token, witness, and deadlines.

### ownerAddress

`` `0x${string}` ``

Address whose private key authorizes the permit.

## Returns

`Promise`\<[`PermitSignature`](../type-aliases/PermitSignature.md)\>

Split signature along with the original signature hex string.
