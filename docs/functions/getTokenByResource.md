[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / getTokenByResource

# Function: getTokenByResource()

> **getTokenByResource**(`registry`, `resource`, `networkMap`): [`TokenRegistry`](../type-aliases/TokenRegistry.md)

Defined in: [src/lib/tokenUtils.ts:64](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/tokenUtils.ts#L64)

Gets the token registry entry for a given resource.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

The token registry index to search

### resource

[`AppResource`](../type-aliases/AppResource.md)

The encoded resource with status information

### networkMap

`Record`\<`string`, `string`\>

## Returns

[`TokenRegistry`](../type-aliases/TokenRegistry.md)

The matching token registry or a placeholder for unknown tokens
