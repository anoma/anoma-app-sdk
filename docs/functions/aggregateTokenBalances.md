[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / aggregateTokenBalances

# Function: aggregateTokenBalances()

> **aggregateTokenBalances**(`resources`, `registry`, `prices`, `networkMap`): [`AggregatedTokenBalancesOutput`](../type-aliases/AggregatedTokenBalancesOutput.md)

Defined in: [src/domain/resources/services.ts:338](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/services.ts#L338)

Aggregates a flat list of resources into per-token balances with USD totals.

Groups resources by their token (resolved via registry), sums raw quantities,
computes a USD total using the provided price map, and formats each balance
for display.

## Parameters

### resources

[`AppResource`](../type-aliases/AppResource.md)[]

Decoded app resources (consumed or available).

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

Token registry index for resolving resource → token.

### prices

`Record`\<`Address`, `number`\>

Map of ERC-20 address → USD price.

### networkMap

`Record`\<`string`, `string`\>

## Returns

[`AggregatedTokenBalancesOutput`](../type-aliases/AggregatedTokenBalancesOutput.md)

Aggregated balances per token and a grand total in USD.
