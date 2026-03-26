[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / SecretKey

# Class: SecretKey

Defined in: [src/wasm/arm\_bindings.d.ts:222](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L222)

## Constructors

### Constructor

> **new SecretKey**(`bytes`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:225](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L225)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`SecretKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:224](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L224)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:223](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L223)

#### Returns

`void`

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:231](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L231)

#### Returns

`string`

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:229](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L229)

#### Returns

`Uint8Array`

***

### toHex()

> **toHex**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:233](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L233)

#### Returns

`string`

***

### toPublicKey()

> **toPublicKey**(): [`PublicKey`](PublicKey.md)

Defined in: [src/wasm/arm\_bindings.d.ts:227](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L227)

#### Returns

[`PublicKey`](PublicKey.md)

***

### fromBase64()

> `static` **fromBase64**(`sk_b64`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:230](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L230)

#### Parameters

##### sk\_b64

`string`

#### Returns

`SecretKey`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:228](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L228)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`SecretKey`

***

### fromHex()

> `static` **fromHex**(`sk_hex`): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:232](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L232)

#### Parameters

##### sk\_hex

`string`

#### Returns

`SecretKey`

***

### random()

> `static` **random**(): `SecretKey`

Defined in: [src/wasm/arm\_bindings.d.ts:226](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L226)

#### Returns

`SecretKey`
