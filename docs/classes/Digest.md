[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / Digest

# Class: Digest

Defined in: [src/wasm/arm\_bindings.d.ts:86](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L86)

## Constructors

### Constructor

> **new Digest**(`bytes`): `Digest`

Defined in: [src/wasm/arm\_bindings.d.ts:89](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L89)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`Digest`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:88](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L88)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:87](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L87)

#### Returns

`void`

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:91](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L91)

#### Returns

`Uint8Array`

***

### toHex()

> **toHex**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:92](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L92)

#### Returns

`string`

***

### default()

> `static` **default**(): `Digest`

Defined in: [src/wasm/arm\_bindings.d.ts:94](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L94)

#### Returns

`Digest`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `Digest`

Defined in: [src/wasm/arm\_bindings.d.ts:90](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L90)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`Digest`

***

### fromHex()

> `static` **fromHex**(`hex`): `Digest`

Defined in: [src/wasm/arm\_bindings.d.ts:93](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L93)

#### Parameters

##### hex

`string`

#### Returns

`Digest`
