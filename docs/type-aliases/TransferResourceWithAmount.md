[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / TransferResourceWithAmount

# Type Alias: TransferResourceWithAmount

> **TransferResourceWithAmount** = `object`

Defined in: [src/domain/resources/types.ts:8](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/types.ts#L8)

A collection of transfer resources with the amount to transfer.
NOTE: Amount may be less than resource quantity, in this case,
we have a split:

## Properties

### resource

> **resource**: [`AppResource`](AppResource.md)

Defined in: [src/domain/resources/types.ts:9](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/types.ts#L9)

---

### targetAmount

> **targetAmount**: `bigint`

Defined in: [src/domain/resources/types.ts:10](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/types.ts#L10)
