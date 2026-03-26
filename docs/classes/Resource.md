[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / Resource

# Class: Resource

Defined in: [src/wasm/arm\_bindings.d.ts:191](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L191)

## Constructors

### Constructor

> **new Resource**(`props`): `Resource`

Defined in: [src/wasm/arm\_bindings.d.ts:194](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L194)

#### Parameters

##### props

[`ResourceProps`](../interfaces/ResourceProps.md)

#### Returns

`Resource`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:193](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L193)

#### Returns

`void`

***

### commitment()

> **commitment**(): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:198](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L198)

#### Returns

[`Digest`](Digest.md)

***

### encode()

> **encode**(): [`EncodedResource`](../interfaces/EncodedResource.md)

Defined in: [src/wasm/arm\_bindings.d.ts:196](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L196)

#### Returns

[`EncodedResource`](../interfaces/EncodedResource.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:192](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L192)

#### Returns

`void`

***

### nullifier()

> **nullifier**(`nf_key`): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:199](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L199)

#### Parameters

##### nf\_key

[`NullifierKey`](NullifierKey.md)

#### Returns

[`Digest`](Digest.md)

***

### create()

> `static` **create**(`logic_ref`, `label_ref`, `quantity`, `value_ref`, `is_ephemeral`, `nonce`, `nk_cmt`): `Resource`

Defined in: [src/wasm/arm\_bindings.d.ts:195](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L195)

#### Parameters

##### logic\_ref

[`Digest`](Digest.md)

##### label\_ref

[`Digest`](Digest.md)

##### quantity

`bigint`

##### value\_ref

[`Digest`](Digest.md)

##### is\_ephemeral

`boolean`

##### nonce

[`Digest`](Digest.md)

##### nk\_cmt

[`NullifierKeyCommitment`](NullifierKeyCommitment.md)

#### Returns

`Resource`

***

### decode()

> `static` **decode**(`encoded`): `Resource`

Defined in: [src/wasm/arm\_bindings.d.ts:197](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L197)

#### Parameters

##### encoded

[`EncodedResource`](../interfaces/EncodedResource.md)

#### Returns

`Resource`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `Resource`

Defined in: [src/wasm/arm\_bindings.d.ts:200](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L200)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`Resource`
