[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / convertWalletBalanceToTokenBalance

# Function: convertWalletBalanceToTokenBalance()

> **convertWalletBalanceToTokenBalance**(`registry`, `network`, `balances?`): [`TokenBalance`](../type-aliases/TokenBalance.md)[]

Defined in: [src/lib/tokenUtils.ts:112](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/tokenUtils.ts#L112)

Converts raw wallet balances into `TokenBalance` entries, filtering out tokens not in the registry.

## Parameters

### registry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

### network

`string`

### balances?

[`WalletBalance`](../interfaces/WalletBalance.md)[] = `[]`

## Returns

[`TokenBalance`](../type-aliases/TokenBalance.md)[]
