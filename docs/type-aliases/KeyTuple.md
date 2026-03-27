[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / KeyTuple

# Type Alias: KeyTuple

> **KeyTuple** = \[`Uint8Array`, `Uint8Array`\]

Defined in: [src/domain/keys/types.ts:7](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/domain/keys/types.ts#L7)

KeyTuple is ordered [privateKey, publicKey] except for the case of
Nullifier, where we assume [nk, cnk] (Nullifier Key, Nullifier Commitment Key)
