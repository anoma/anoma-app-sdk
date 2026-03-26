[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / tokenId

# Function: tokenId()

> **tokenId**(`tokenRegistry`): `` `base:${string}` `` \| `` `ethereum:${string}` `` \| `` `ethereum-sepolia:${string}` `` \| `` `bsc:${string}` `` \| `` `unknown:${string}` ``

Defined in: [src/lib/tokenUtils.ts:39](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/tokenUtils.ts#L39)

Builds a `TokenId` from a token's network and lowercased symbol (e.g. `"base:usdc"`).

## Parameters

### tokenRegistry

`Pick`\<[`TokenRegistry`](../type-aliases/TokenRegistry.md), `"network"` \| `"symbol"`\>

## Returns

`` `base:${string}` `` \| `` `ethereum:${string}` `` \| `` `ethereum-sepolia:${string}` `` \| `` `bsc:${string}` `` \| `` `unknown:${string}` ``
