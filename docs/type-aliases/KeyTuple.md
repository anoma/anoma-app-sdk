[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / KeyTuple

# Type Alias: KeyTuple

> **KeyTuple** = \[`Uint8Array`, `Uint8Array`\]

Defined in: [src/domain/keys/types.ts:7](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/types.ts#L7)

KeyTuple is ordered [privateKey, publicKey] except for the case of
Nullifier, where we assume [nk, cnk] (Nullifier Key, Nullifier Commitment Key)
