[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / ConsumedResourceDraft

# Type Alias: ConsumedResourceDraft

> **ConsumedResourceDraft** = `object` & \{ `type`: `"AnomaAddress"`; `userPublicKeys`: [`UserPublicKeys`](UserPublicKeys.md); \} \| \{ `address`: `Address`; `permit2Data`: [`Permit2Data`](Permit2Data.md); `type`: `"EvmAddress"`; \} \| \{ `type`: `"Padding"`; \}

Defined in: [src/domain/transfer/types/resources.ts:76](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/domain/transfer/types/resources.ts#L76)

## Type Declaration

### nullifierKey

> **nullifierKey**: [`NullifierKey`](../classes/NullifierKey.md)

### resource

> **resource**: [`Resource`](../classes/Resource.md)

### token?

> `optional` **token**: [`TokenRegistry`](TokenRegistry.md)
