[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / tokenId

# Function: tokenId()

> **tokenId**(`tokenRegistry`): `` `base:${string}` `` \| `` `ethereum:${string}` `` \| `` `ethereum-sepolia:${string}` `` \| `` `bsc:${string}` `` \| `` `unknown:${string}` ``

Defined in: [src/lib/tokenUtils.ts:29](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/tokenUtils.ts#L29)

Builds a `TokenId` from a token's network and lowercased symbol (e.g. `"base:usdc"`).

## Parameters

### tokenRegistry

`Pick`\<[`TokenRegistry`](../type-aliases/TokenRegistry.md), `"network"` \| `"symbol"`\>

## Returns

`` `base:${string}` `` \| `` `ethereum:${string}` `` \| `` `ethereum-sepolia:${string}` `` \| `` `bsc:${string}` `` \| `` `unknown:${string}` ``
