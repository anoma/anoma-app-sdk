[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / KeyTuple

# Type Alias: KeyTuple

> **KeyTuple** = \[`Uint8Array`, `Uint8Array`\]

Defined in: [src/domain/keys/types.ts:7](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/domain/keys/types.ts#L7)

KeyTuple is ordered [privateKey, publicKey] except for the case of
Nullifier, where we assume [nk, cnk] (Nullifier Key, Nullifier Commitment Key)
