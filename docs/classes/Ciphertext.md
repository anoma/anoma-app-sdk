[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / Ciphertext

# Class: Ciphertext

Defined in: [src/wasm/arm\_bindings.d.ts:74](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L74)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:77](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L77)

#### Returns

`void`

***

### asWords()

> **asWords**(): `Uint32Array`

Defined in: [src/wasm/arm\_bindings.d.ts:81](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L81)

#### Returns

`Uint32Array`

***

### decrypt()

> **decrypt**(`sk`): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:83](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L83)

#### Parameters

##### sk

[`SecretKey`](SecretKey.md)

#### Returns

`Uint8Array`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:76](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L76)

#### Returns

`void`

***

### inner()

> **inner**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:80](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L80)

#### Returns

`Uint8Array`

***

### toJson()

> **toJson**(): `any`

Defined in: [src/wasm/arm\_bindings.d.ts:84](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L84)

#### Returns

`any`

***

### encrypt()

> `static` **encrypt**(`message`, `receiver_pk`, `sender_sk`): `Ciphertext`

Defined in: [src/wasm/arm\_bindings.d.ts:82](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L82)

#### Parameters

##### message

`Uint8Array`

##### receiver\_pk

[`PublicKey`](PublicKey.md)

##### sender\_sk

[`SecretKey`](SecretKey.md)

#### Returns

`Ciphertext`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `Ciphertext`

Defined in: [src/wasm/arm\_bindings.d.ts:78](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L78)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`Ciphertext`

***

### fromWords()

> `static` **fromWords**(`words`): `Ciphertext`

Defined in: [src/wasm/arm\_bindings.d.ts:79](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L79)

#### Parameters

##### words

`Uint32Array`

#### Returns

`Ciphertext`
