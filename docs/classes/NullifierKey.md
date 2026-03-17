[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / NullifierKey

# Class: NullifierKey

Defined in: [src/wasm/arm\_bindings.d.ts:145](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L145)

## Constructors

### Constructor

> **new NullifierKey**(`nk_bytes`): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:148](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L148)

#### Parameters

##### nk\_bytes

`Uint8Array`

#### Returns

`NullifierKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:147](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L147)

#### Returns

`void`

***

### commit()

> **commit**(): [`NullifierKeyCommitment`](NullifierKeyCommitment.md)

Defined in: [src/wasm/arm\_bindings.d.ts:149](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L149)

#### Returns

[`NullifierKeyCommitment`](NullifierKeyCommitment.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:146](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L146)

#### Returns

`void`

***

### inner()

> **inner**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:150](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L150)

#### Returns

`Uint8Array`

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:152](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L152)

#### Returns

`string`

***

### default()

> `static` **default**(): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:154](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L154)

#### Returns

`NullifierKey`

***

### fromBase64()

> `static` **fromBase64**(`encoded`): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:153](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L153)

#### Parameters

##### encoded

`string`

#### Returns

`NullifierKey`

***

### random()

> `static` **random**(): [`NullifierKeyPair`](NullifierKeyPair.md)

Defined in: [src/wasm/arm\_bindings.d.ts:151](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L151)

#### Returns

[`NullifierKeyPair`](NullifierKeyPair.md)
