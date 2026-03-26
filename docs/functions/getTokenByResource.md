[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / getTokenByResource

# Function: getTokenByResource()

> **getTokenByResource**(`registry`, `resource`): [`TokenRegistry`](../type-aliases/TokenRegistry.md)

Defined in: [src/lib/tokenUtils.ts:51](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/tokenUtils.ts#L51)

Gets the token registry entry for a given resource.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

The token registry index to search

### resource

[`AppResource`](../type-aliases/AppResource.md)

The encoded resource with status information

## Returns

[`TokenRegistry`](../type-aliases/TokenRegistry.md)

The matching token registry or a placeholder for unknown tokens
