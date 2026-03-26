[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / getTokenById

# Function: getTokenById()

> **getTokenById**(`registry`, `id`): [`TokenRegistry`](../type-aliases/TokenRegistry.md) \| `undefined`

Defined in: [src/lib/tokenUtils.ts:73](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/tokenUtils.ts#L73)

Finds a token registry entry matching both network and symbol.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

### id

`` `base:${string}` `` | `` `ethereum:${string}` `` | `` `ethereum-sepolia:${string}` `` | `` `bsc:${string}` `` | `` `unknown:${string}` ``

## Returns

[`TokenRegistry`](../type-aliases/TokenRegistry.md) \| `undefined`
