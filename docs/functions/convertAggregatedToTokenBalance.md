[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / convertAggregatedToTokenBalance

# Function: convertAggregatedToTokenBalance()

> **convertAggregatedToTokenBalance**(`registry`, `balancesPerToken`): [`TokenBalance`](../type-aliases/TokenBalance.md)[]

Defined in: [src/lib/tokenUtils.ts:57](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/tokenUtils.ts#L57)

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
