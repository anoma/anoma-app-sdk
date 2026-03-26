[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / convertAggregatedToTokenBalance

# Function: convertAggregatedToTokenBalance()

> **convertAggregatedToTokenBalance**(`registry`, `balancesPerToken`): [`TokenBalance`](../type-aliases/TokenBalance.md)[]

Defined in: [src/lib/tokenUtils.ts:85](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/tokenUtils.ts#L85)

Converts aggregated token balances to TokenBalance array format
for use in transfer forms and other components.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

The token registry index to look up tokens in

### balancesPerToken

`Record`\<[`TokenId`](../type-aliases/TokenId.md), `AggregatedTokenBalance`\>

Record of token balances from useAggregatedTokenBalances

## Returns

[`TokenBalance`](../type-aliases/TokenBalance.md)[]

Array of TokenBalance objects with full token registry and amount
