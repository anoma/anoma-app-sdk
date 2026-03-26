[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / AuthoritySigningKey

# Class: AuthoritySigningKey

Defined in: [src/wasm/arm\_bindings.d.ts:44](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L44)

## Constructors

### Constructor

> **new AuthoritySigningKey**(): `AuthoritySigningKey`

Defined in: [src/wasm/arm\_bindings.d.ts:47](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L47)

#### Returns

`AuthoritySigningKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:46](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L46)

#### Returns

`void`

***

### authorize()

> **authorize**(`domain`, `action_tree`): [`AuthoritySignature`](AuthoritySignature.md)

Defined in: [src/wasm/arm\_bindings.d.ts:49](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L49)

#### Parameters

##### domain

`string`

##### action\_tree

[`MerkleTree`](MerkleTree.md)

#### Returns

[`AuthoritySignature`](AuthoritySignature.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:45](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L45)

#### Returns

`void`

***

### sign()

> **sign**(`domain`, `message`): [`AuthoritySignature`](AuthoritySignature.md)

Defined in: [src/wasm/arm\_bindings.d.ts:48](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L48)

#### Parameters

##### domain

`string`

##### message

`Uint8Array`

#### Returns

[`AuthoritySignature`](AuthoritySignature.md)

***

### toBytes()

> **toBytes**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:50](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L50)

#### Returns

`Uint8Array`

***

### fromBytes()

> `static` **fromBytes**(`bytes`): `AuthoritySigningKey`

Defined in: [src/wasm/arm\_bindings.d.ts:51](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L51)

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`AuthoritySigningKey`
