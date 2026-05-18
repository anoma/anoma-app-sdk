[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / buildAppResources

# Function: buildAppResources()

> **buildAppResources**(`resources`, `transactionLookup`, `nullifierKey`, `onlyAvailableResources?`): `Promise`\<[`AppResource`](../type-aliases/AppResource.md)[]\>

Defined in: [src/domain/resources/services.ts:109](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/services.ts#L109)

Computes nullifiers and consumption status for each resource, returning enriched AppResource entries.

## Parameters

### resources

`ResourceWithDetails`[]

### transactionLookup

`TransactionLookup`

### nullifierKey

`NullifierKey`

### onlyAvailableResources?

`boolean` = `true`

## Returns

`Promise`\<[`AppResource`](../type-aliases/AppResource.md)[]\>
