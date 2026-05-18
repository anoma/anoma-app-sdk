[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / ConsumedResourceDraft

# Type Alias: ConsumedResourceDraft

> **ConsumedResourceDraft** = `object` & \{ `type`: `"AnomaAddress"`; `userPublicKeys`: [`UserPublicKeys`](UserPublicKeys.md); \} \| \{ `address`: `Address`; `permit2Data`: [`Permit2Data`](Permit2Data.md); `type`: `"EvmAddress"`; \} \| \{ `type`: `"Padding"`; \}

Defined in: [src/domain/transfer/types/resources.ts:81](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/types/resources.ts#L81)

## Type Declaration

### nullifierKey

> **nullifierKey**: `NullifierKey`

### resource

> **resource**: `Resource`

### token?

> `optional` **token?**: [`TokenRegistry`](TokenRegistry.md)
