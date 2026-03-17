[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / AuthorityVerifyingKey

# Class: AuthorityVerifyingKey

Defined in: [src/wasm/arm\_bindings.d.ts:54](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L54)

## Constructors

### Constructor

> **new AuthorityVerifyingKey**(`pk_bytes`): `AuthorityVerifyingKey`

Defined in: [src/wasm/arm\_bindings.d.ts:57](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L57)

#### Parameters

##### pk\_bytes

`Uint8Array`

#### Returns

`AuthorityVerifyingKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:56](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L56)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:55](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L55)

#### Returns

`void`

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:61](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L61)

#### Returns

`Uint8Array`

***

### verify()

> **verify**(`domain`, `message`, `signature`): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:59](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L59)

#### Parameters

##### domain

`string`

##### message

`Uint8Array`

##### signature

[`AuthoritySignature`](AuthoritySignature.md)

#### Returns

`void`

***

### fromHex()

> `static` **fromHex**(`pk_hex`): `AuthorityVerifyingKey`

Defined in: [src/wasm/arm\_bindings.d.ts:60](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L60)

#### Parameters

##### pk\_hex

`string`

#### Returns

`AuthorityVerifyingKey`

***

### fromSigningKey()

> `static` **fromSigningKey**(`signing_key`): `AuthorityVerifyingKey`

Defined in: [src/wasm/arm\_bindings.d.ts:58](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L58)

#### Parameters

##### signing\_key

[`AuthoritySigningKey`](AuthoritySigningKey.md)

#### Returns

`AuthorityVerifyingKey`
