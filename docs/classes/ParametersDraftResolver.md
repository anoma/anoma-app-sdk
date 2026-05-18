[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / ParametersDraftResolver

# Class: ParametersDraftResolver

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:34](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L34)

Orchestrates resource selection, creation, and padding for transfers
supporting multiple receivers and mixed address types.

## Constructors

### Constructor

> **new ParametersDraftResolver**(`transferBuilder`, `keyring`, `chain`): `ParametersDraftResolver`

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:40](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L40)

#### Parameters

##### transferBuilder

[`TransferBuilder`](TransferBuilder.md)

##### keyring

[`UserKeyring`](../type-aliases/UserKeyring.md)

##### chain

[`SupportedChain`](../type-aliases/SupportedChain.md)

#### Returns

`ParametersDraftResolver`

## Properties

### chain

> `protected` **chain**: [`SupportedChain`](../type-aliases/SupportedChain.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:37](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L37)

---

### keyring

> `protected` **keyring**: [`UserKeyring`](../type-aliases/UserKeyring.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:36](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L36)

---

### receivers

> `protected` **receivers**: [`Receiver`](../type-aliases/Receiver.md)[] = `[]`

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:38](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L38)

---

### transferBuilder

> `protected` **transferBuilder**: [`TransferBuilder`](TransferBuilder.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:35](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L35)

## Methods

### addReceiver()

> **addReceiver**(`receiver`): `ParametersDraftResolver`

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:51](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L51)

Adds a receiver to the transfer.

#### Parameters

##### receiver

[`Receiver`](../type-aliases/Receiver.md)

#### Returns

`ParametersDraftResolver`

---

### build()

> **build**(`userResources`): [`ResolvedParameters`](../type-aliases/ResolvedParameters.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:228](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L228)

Builds the full transfer parameters by selecting resources, creating
consumed/created entries, balancing with padding, authorizing, and
serializing into the Parameters structure.

#### Parameters

##### userResources

[`AppResource`](../type-aliases/AppResource.md)[]

#### Returns

[`ResolvedParameters`](../type-aliases/ResolvedParameters.md)

---

### checkForRemainders()

> `protected` **checkForRemainders**(`selectedResourcesMap`): [`Receiver`](../type-aliases/Receiver.md)[]

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:104](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L104)

Checks for remainder amounts after resource selection and returns
receivers for the change that should go back to the sender.

#### Parameters

##### selectedResourcesMap

`Map`\<`` `${string}:${string}` ``, `TokenResourceWithAmount`\>

#### Returns

[`Receiver`](../type-aliases/Receiver.md)[]

---

### getConsumedResourceDraftList()

> **getConsumedResourceDraftList**(`selectedResourcesMap`): [`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)[]

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:130](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L130)

Converts selected resources into ConsumedResourceDraft entries for the sender.

#### Parameters

##### selectedResourcesMap

`Map`\<`` `${string}:${string}` ``, `TokenResourceWithAmount`\>

#### Returns

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)[]

---

### getConsumedResourceDraftPadding()

> **getConsumedResourceDraftPadding**(): [`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:215](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L215)

Creates a padding ConsumedResourceDraft with a trivial resource.

#### Returns

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)

---

### getCreatedResourceDraftList()

> **getCreatedResourceDraftList**(`consumedResources`, `receivers`): [`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)[]

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:156](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L156)

Creates transfer resources for each receiver, using the
corresponding consumed resource as the input.

#### Parameters

##### consumedResources

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)[]

##### receivers

[`Receiver`](../type-aliases/Receiver.md)[]

#### Returns

[`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)[]

---

### getCreatedResourceDraftPadding()

> **getCreatedResourceDraftPadding**(`consumedResource`): [`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:202](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L202)

Creates a padding CreatedResourceDraft with a trivial resource.

#### Parameters

##### consumedResource

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)

#### Returns

[`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)

---

### groupPayableAmountsByToken()

> `protected` **groupPayableAmountsByToken**(): `Map`\<`` `${string}:${string}` ``, `TokenAmount`\>

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:59](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L59)

Returns a Map of token IDs to the total amount payable for a given token.

#### Returns

`Map`\<`` `${string}:${string}` ``, `TokenAmount`\>

---

### selectResources()

> `protected` **selectResources**(`resources`): `Map`\<`` `${string}:${string}` ``, `TokenResourceWithAmount`\>

Defined in: [src/domain/transfer/models/ParametersDraftResolver.ts:77](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/ParametersDraftResolver.ts#L77)

Selects the minimum set of user resources needed to fulfill all receivers, grouped by token.

#### Parameters

##### resources

[`AppResource`](../type-aliases/AppResource.md)[]

#### Returns

`Map`\<`` `${string}:${string}` ``, `TokenResourceWithAmount`\>
