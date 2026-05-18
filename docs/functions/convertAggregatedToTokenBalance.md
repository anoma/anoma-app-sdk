[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / convertAggregatedToTokenBalance

# Function: convertAggregatedToTokenBalance()

> **convertAggregatedToTokenBalance**(`registry`, `balancesPerToken`): [`TokenBalance`](../type-aliases/TokenBalance.md)[]

Defined in: [src/lib/tokenUtils.ts:99](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/tokenUtils.ts#L99)

Converts aggregated token balances to TokenBalance array format
for use in transfer forms and other components.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

The token registry index to look up tokens in

### balancesPerToken

`Record`\<[`TokenId`](../type-aliases/TokenId.md), [`AggregatedTokenBalance`](../type-aliases/AggregatedTokenBalance.md)\>

Record of token balances from useAggregatedTokenBalances

## Returns

[`TokenBalance`](../type-aliases/TokenBalance.md)[]

Array of TokenBalance objects with full token registry and amount
