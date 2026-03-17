[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / NullifierKeyPair

# Class: NullifierKeyPair

Defined in: [src/wasm/arm\_bindings.d.ts:166](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L166)

## Constructors

### Constructor

> **new NullifierKeyPair**(`nk`, `cnk`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:169](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L169)

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

Defined in: [src/wasm/arm\_bindings.d.ts:175](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L175)

***

### nk

> **nk**: [`NullifierKey`](NullifierKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:174](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L174)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:168](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L168)

#### Returns

`void`

***

### encode()

> **encode**(): [`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

Defined in: [src/wasm/arm\_bindings.d.ts:172](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L172)

#### Returns

[`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:167](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L167)

#### Returns

`void`

***

### toJson()

> **toJson**(): `any`

Defined in: [src/wasm/arm\_bindings.d.ts:170](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L170)

#### Returns

`any`

***

### decode()

> `static` **decode**(`encoded`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:173](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L173)

#### Parameters

##### encoded

[`EncodedNullifierKeyPair`](../interfaces/EncodedNullifierKeyPair.md)

#### Returns

`NullifierKeyPair`

***

### fromJson()

> `static` **fromJson**(`json`): `NullifierKeyPair`

Defined in: [src/wasm/arm\_bindings.d.ts:171](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L171)

#### Parameters

##### json

`any`

#### Returns

`NullifierKeyPair`
