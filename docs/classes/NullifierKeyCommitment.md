[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / NullifierKeyCommitment

# Class: NullifierKeyCommitment

Defined in: [src/wasm/arm\_bindings.d.ts:157](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L157)

## Constructors

### Constructor

> **new NullifierKeyCommitment**(`nk_cmt_bytes`): `NullifierKeyCommitment`

Defined in: [src/wasm/arm\_bindings.d.ts:160](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L160)

#### Parameters

##### nk\_cmt\_bytes

`Uint8Array`

#### Returns

`NullifierKeyCommitment`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:159](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L159)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:158](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L158)

#### Returns

`void`

***

### inner()

> **inner**(): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:161](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L161)

#### Returns

[`Digest`](Digest.md)

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:162](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L162)

#### Returns

`string`

***

### fromBase64()

> `static` **fromBase64**(`encoded`): `NullifierKeyCommitment`

Defined in: [src/wasm/arm\_bindings.d.ts:163](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L163)

#### Parameters

##### encoded

`string`

#### Returns

`NullifierKeyCommitment`
