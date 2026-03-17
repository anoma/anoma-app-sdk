[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / Keypair

# Class: Keypair

Defined in: [src/wasm/arm\_bindings.d.ts:119](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L119)

## Properties

### pk

> **pk**: [`PublicKey`](PublicKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:130](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L130)

***

### sk

> **sk**: [`SecretKey`](SecretKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:129](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L129)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:122](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L122)

#### Returns

`void`

***

### encode()

> **encode**(): [`EncodedKeypair`](../interfaces/EncodedKeypair.md)

Defined in: [src/wasm/arm\_bindings.d.ts:124](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L124)

#### Returns

[`EncodedKeypair`](../interfaces/EncodedKeypair.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:121](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L121)

#### Returns

`void`

***

### serialize()

> **serialize**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:127](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L127)

#### Returns

`Uint8Array`

***

### decode()

> `static` **decode**(`encoded`): `Keypair`

Defined in: [src/wasm/arm\_bindings.d.ts:125](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L125)

#### Parameters

##### encoded

[`EncodedKeypair`](../interfaces/EncodedKeypair.md)

#### Returns

`Keypair`

***

### deserialize()

> `static` **deserialize**(`bytes`): [`SecretKey`](SecretKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:128](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L128)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

[`SecretKey`](SecretKey.md)

***

### new()

> `static` **new**(`sk_bytes`, `pk_bytes`): `Keypair`

Defined in: [src/wasm/arm\_bindings.d.ts:123](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L123)

#### Parameters

##### sk\_bytes

`Uint8Array`

##### pk\_bytes

`Uint8Array`

#### Returns

`Keypair`

***

### random()

> `static` **random**(): `Keypair`

Defined in: [src/wasm/arm\_bindings.d.ts:126](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L126)

#### Returns

`Keypair`
