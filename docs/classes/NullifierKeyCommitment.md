[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / NullifierKeyCommitment

# Class: NullifierKeyCommitment

Defined in: [src/wasm/arm\_bindings.d.ts:156](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L156)

## Constructors

### Constructor

> **new NullifierKeyCommitment**(`nk_cmt_bytes`): `NullifierKeyCommitment`

Defined in: [src/wasm/arm\_bindings.d.ts:159](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L159)

#### Parameters

##### nk\_cmt\_bytes

`Uint8Array`

#### Returns

`NullifierKeyCommitment`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:158](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L158)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:157](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L157)

#### Returns

`void`

***

### inner()

> **inner**(): [`Digest`](Digest.md)

Defined in: [src/wasm/arm\_bindings.d.ts:160](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L160)

#### Returns

[`Digest`](Digest.md)

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:161](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L161)

#### Returns

`string`

***

### fromBase64()

> `static` **fromBase64**(`encoded`): `NullifierKeyCommitment`

Defined in: [src/wasm/arm\_bindings.d.ts:162](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L162)

#### Parameters

##### encoded

`string`

#### Returns

`NullifierKeyCommitment`
