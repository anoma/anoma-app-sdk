[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / getTokenById

# Function: getTokenById()

> **getTokenById**(`registry`, `id`): [`TokenRegistry`](../type-aliases/TokenRegistry.md) \| `undefined`

Defined in: [src/lib/tokenUtils.ts:45](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/tokenUtils.ts#L45)

Finds a token registry entry matching both network and symbol.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

### id

`` `base:${string}` `` | `` `ethereum:${string}` `` | `` `ethereum-sepolia:${string}` `` | `` `bsc:${string}` `` | `` `unknown:${string}` ``

## Returns

[`TokenRegistry`](../type-aliases/TokenRegistry.md) \| `undefined`
