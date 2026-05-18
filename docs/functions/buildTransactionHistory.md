[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / buildTransactionHistory

# Function: buildTransactionHistory()

> **buildTransactionHistory**(`resources`, `tokenRegistry`, `networkMap`): [`TransactionReceipt`](../type-aliases/TransactionReceipt.md)[]

Defined in: [src/domain/history/services.ts:57](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/history/services.ts#L57)

Groups resources by transaction and returns receipts sorted most-recent first.

## Parameters

### resources

[`AppResource`](../type-aliases/AppResource.md)[]

### tokenRegistry

[`TokenRegistryIndex`](../type-aliases/TokenRegistryIndex.md)

### networkMap

`Record`\<`string`, `string`\>

## Returns

[`TransactionReceipt`](../type-aliases/TransactionReceipt.md)[]
