[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / buildBalanceIndex

# Function: buildBalanceIndex()

> **buildBalanceIndex**(`balances`): `Record`\<[`TokenId`](../type-aliases/TokenId.md), [`TokenBalance`](../type-aliases/TokenBalance.md)\>

Defined in: [src/lib/tokenUtils.ts:124](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/tokenUtils.ts#L124)

Builds a `Record<TokenId, TokenBalance>` index for O(1) balance lookups.

## Parameters

### balances

[`TokenBalance`](../type-aliases/TokenBalance.md)[]

## Returns

`Record`\<[`TokenId`](../type-aliases/TokenId.md), [`TokenBalance`](../type-aliases/TokenBalance.md)\>
