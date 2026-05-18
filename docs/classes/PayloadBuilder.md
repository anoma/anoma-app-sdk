[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / PayloadBuilder

# Class: PayloadBuilder

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:27](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L27)

Constructs the backend-compatible Parameters payload from resolved
consumed/created resource items, handling witness data generation
and authorization signing.

## Constructors

### Constructor

> **new PayloadBuilder**(`resolvedParameters`): `PayloadBuilder`

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:32](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L32)

#### Parameters

##### resolvedParameters

[`ResolvedParameters`](../type-aliases/ResolvedParameters.md)

#### Returns

`PayloadBuilder`

## Properties

### authorizationSignature

> **authorizationSignature**: `AuthoritySignature` \| `undefined`

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:30](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L30)

---

### consumingResources

> **consumingResources**: [`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)[]

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:28](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L28)

---

### creatingResources

> **creatingResources**: [`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)[]

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:29](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L29)

## Methods

### build()

> **build**(): [`Parameters`](../type-aliases/Parameters.md)

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:173](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L173)

Builds the final Parameters object by encoding all consumed and created resources.

#### Returns

[`Parameters`](../type-aliases/Parameters.md)

---

### getConsumedResourcePayload()

> **getConsumedResourcePayload**(`item`): [`ConsumedResource`](../type-aliases/ConsumedResource.md)

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:156](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L156)

Encodes a consuming item into the serialized consumed resource payload.

#### Parameters

##### item

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)

#### Returns

[`ConsumedResource`](../type-aliases/ConsumedResource.md)

---

### getCreatedResourcesPayload()

> **getCreatedResourcesPayload**(`item`): [`CreatedResource`](../type-aliases/CreatedResource.md)

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:165](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L165)

Encodes a creating item into the serialized created resource payload.

#### Parameters

##### item

[`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)

#### Returns

[`CreatedResource`](../type-aliases/CreatedResource.md)

---

### getWitnessForConsumedResource()

> **getWitnessForConsumedResource**(`item`): `Partial`\<[`ConsumedWitnessDataSchema`](../type-aliases/ConsumedWitnessDataSchema.md)\>

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:56](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L56)

Returns the witness data for a consumed resource based on its sender type.

#### Parameters

##### item

[`ConsumedResourceDraft`](../type-aliases/ConsumedResourceDraft.md)

#### Returns

`Partial`\<[`ConsumedWitnessDataSchema`](../type-aliases/ConsumedWitnessDataSchema.md)\>

---

### getWitnessForCreatedResource()

> **getWitnessForCreatedResource**(`item`): `Partial`\<[`CreatedWitnessDataSchema`](../type-aliases/CreatedWitnessDataSchema.md)\>

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:104](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L104)

Returns the witness data for a created resource based on its receiver type.

#### Parameters

##### item

[`CreatedResourceDraft`](../type-aliases/CreatedResourceDraft.md)

#### Returns

`Partial`\<[`CreatedWitnessDataSchema`](../type-aliases/CreatedWitnessDataSchema.md)\>

---

### getWitnessForPaddingResource()

> **getWitnessForPaddingResource**(): `object`

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:149](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L149)

Returns trivial ephemeral witness data used for padding resources.

#### Returns

`object`

##### TrivialEphemeral

> **TrivialEphemeral**: `object` = `{}`

---

### withAuthorization()

> **withAuthorization**(`authorityPrivateKey`): `PayloadBuilder`

Defined in: [src/domain/transfer/models/PayloadBuilder.ts:38](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/PayloadBuilder.ts#L38)

Signs all consumed/created resource pairs and stores the authorization signature.

#### Parameters

##### authorityPrivateKey

`Uint8Array`\<`ArrayBuffer`\>

#### Returns

`PayloadBuilder`
