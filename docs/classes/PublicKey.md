[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / PublicKey

# Class: PublicKey

Defined in: [src/wasm/arm\_bindings.d.ts:178](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L178)

## Constructors

### Constructor

> **new PublicKey**(`bytes`): `PublicKey`

Defined in: [src/wasm/arm\_bindings.d.ts:181](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L181)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`PublicKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:180](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L180)

#### Returns

`void`

***

### encode()

> **encode**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:189](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L189)

#### Returns

`Uint8Array`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:179](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L179)

#### Returns

`void`

***

### toAffinePointBytes()

> **toAffinePointBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:187](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L187)

#### Returns

`Uint8Array`

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:183](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L183)

#### Returns

`string`

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:186](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L186)

#### Returns

`Uint8Array`

***

### toHex()

> **toHex**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:185](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L185)

#### Returns

`string`

***

### fromAffinePointBytes()

> `static` **fromAffinePointBytes**(`bytes`): `PublicKey`

Defined in: [src/wasm/arm\_bindings.d.ts:188](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L188)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`PublicKey`

***

### fromBase64()

> `static` **fromBase64**(`pk_b64`): `PublicKey`

Defined in: [src/wasm/arm\_bindings.d.ts:182](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L182)

#### Parameters

##### pk\_b64

`string`

#### Returns

`PublicKey`

***

### fromHex()

> `static` **fromHex**(`pk_hex`): `PublicKey`

Defined in: [src/wasm/arm\_bindings.d.ts:184](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L184)

#### Parameters

##### pk\_hex

`string`

#### Returns

`PublicKey`
