[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / MerkleTree

# Class: MerkleTree

Defined in: [src/wasm/arm\_bindings.d.ts:133](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L133)

## Constructors

### Constructor

> **new MerkleTree**(`leaves`): `MerkleTree`

Defined in: [src/wasm/arm\_bindings.d.ts:136](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L136)

#### Parameters

##### leaves

[`Digest`](Digest.md)[]

#### Returns

`MerkleTree`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:135](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L135)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:134](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L134)

#### Returns

`void`

***

### root()

> **root**(): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:137](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L137)

#### Returns

[`Digest`](Digest.md)

***

### toWitness()

> **toWitness**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:142](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L142)

Returns hex string representing the actionTreeRoot bytes needed for
Permit2 signing. This is only available in a browser wasm target.

#### Returns

`string`
