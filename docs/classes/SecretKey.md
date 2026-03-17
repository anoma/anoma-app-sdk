[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / SecretKey

# Class: SecretKey

Defined in: [src/wasm/arm\_bindings.d.ts:223](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L223)

## Constructors

### Constructor

> **new SecretKey**(`bytes`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:226](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L226)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`SecretKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:225](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L225)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:224](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L224)

#### Returns

`void`

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:232](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L232)

#### Returns

`string`

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:230](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L230)

#### Returns

`Uint8Array`

***

### toHex()

> **toHex**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:234](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L234)

#### Returns

`string`

***

### toPublicKey()

> **toPublicKey**(): [`PublicKey`](PublicKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:228](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L228)

#### Returns

[`PublicKey`](PublicKey.md)

***

### fromBase64()

> `static` **fromBase64**(`sk_b64`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:231](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L231)

#### Parameters

##### sk\_b64

`string`

#### Returns

`SecretKey`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:229](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L229)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`SecretKey`

***

### fromHex()

> `static` **fromHex**(`sk_hex`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:233](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L233)

#### Parameters

##### sk\_hex

`string`

#### Returns

`SecretKey`

***

### random()

> `static` **random**(): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:227](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L227)

#### Returns

`SecretKey`
