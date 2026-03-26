[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / NullifierKeyPair

# Class: NullifierKeyPair

Defined in: [src/wasm/arm\_bindings.d.ts:165](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L165)

## Constructors

### Constructor

> **new NullifierKeyPair**(`nk`, `cnk`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:168](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L168)

#### Parameters

##### nk

[`NullifierKey`](NullifierKey.md)

##### cnk

[`NullifierKeyCommitment`](NullifierKeyCommitment.md)

#### Returns

`NullifierKeyPair`

## Properties

### cnk

> **cnk**: [`NullifierKeyCommitment`](NullifierKeyCommitment.md)

Defined in: [src/wasm/arm\_bindings.d.ts:174](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L174)

***

### nk

> **nk**: [`NullifierKey`](NullifierKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:173](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L173)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:167](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L167)

#### Returns

`void`

***

### encode()

> **encode**(): [`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

Defined in: [src/wasm/arm\_bindings.d.ts:171](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L171)

#### Returns

[`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:166](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L166)

#### Returns

`void`

***

### toJson()

> **toJson**(): `any`

Defined in: [src/wasm/arm\_bindings.d.ts:169](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L169)

#### Returns

`any`

***

### decode()

> `static` **decode**(`encoded`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:172](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L172)

#### Parameters

##### encoded

[`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

#### Returns

`NullifierKeyPair`

***

### fromJson()

> `static` **fromJson**(`json`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:170](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L170)

#### Parameters

##### json

`any`

#### Returns

`NullifierKeyPair`
