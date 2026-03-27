[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / MerkleTree

# Class: MerkleTree

Defined in: [src/wasm/arm\_bindings.d.ts:132](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L132)

## Constructors

### Constructor

> **new MerkleTree**(`leaves`): `MerkleTree`

Defined in: [src/wasm/arm\_bindings.d.ts:135](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L135)

#### Parameters

##### leaves

[`Digest`](Digest.md)[]

#### Returns

`MerkleTree`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:134](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L134)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:133](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L133)

#### Returns

`void`

***

### root()

> **root**(): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:136](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L136)

#### Returns

[`Digest`](Digest.md)

***

### toWitness()

> **toWitness**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:141](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L141)

Returns hex string representing the actionTreeRoot bytes needed for
Permit2 signing. This is only available in a browser wasm target.

#### Returns

`string`
