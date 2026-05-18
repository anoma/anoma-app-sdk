[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / selectTransferResources

# Function: selectTransferResources()

> **selectTransferResources**(`resources`, `targetAmount`): [`TransferResources`](../type-aliases/TransferResources.md)

Defined in: [src/domain/resources/services.ts:274](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/services.ts#L274)

Determine what resources are needed to fulfill a transfer, either by resources
to sum, a resource to split, or both

## Parameters

### resources

[`AppResource`](../type-aliases/AppResource.md)[]

### targetAmount

`bigint`

## Returns

[`TransferResources`](../type-aliases/TransferResources.md)
