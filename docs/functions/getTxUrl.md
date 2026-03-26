[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / getTxUrl

# Function: getTxUrl()

> **getTxUrl**(`chainId`, `prefixedTxHash`): `string`

Defined in: [src/lib/utils.ts:182](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/lib/utils.ts#L182)

Builds the block explorer URL for a transaction.

## Parameters

### chainId

The chain ID to get the explorer URL for

`1` | `56` | `8453` | `11155111`

### prefixedTxHash

`string`

The transaction hash with 0x prefix

## Returns

`string`

The full URL to view the transaction on the block explorer
