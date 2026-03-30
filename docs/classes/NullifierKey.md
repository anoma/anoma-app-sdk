[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / NullifierKey

# Class: NullifierKey

Defined in: [src/wasm/arm\_bindings.d.ts:144](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L144)

## Constructors

### Constructor

> **new NullifierKey**(`nk_bytes`): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:147](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L147)

#### Parameters

##### nk\_bytes

`Uint8Array`

#### Returns

`NullifierKey`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:146](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L146)

#### Returns

`void`

***

### commit()

> **commit**(): [`NullifierKeyCommitment`](NullifierKeyCommitment.md)

Defined in: [src/wasm/arm\_bindings.d.ts:148](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L148)

#### Returns

[`NullifierKeyCommitment`](NullifierKeyCommitment.md)

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:145](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L145)

#### Returns

`void`

***

### inner()

> **inner**(): `Uint8Array`

Defined in: [src/wasm/arm\_bindings.d.ts:149](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L149)

#### Returns

`Uint8Array`

***

### toBase64()

> **toBase64**(): `string`

Defined in: [src/wasm/arm\_bindings.d.ts:151](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L151)

#### Returns

`string`

***

### default()

> `static` **default**(): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:153](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L153)

#### Returns

`NullifierKey`

***

### fromBase64()

> `static` **fromBase64**(`encoded`): `NullifierKey`

Defined in: [src/wasm/arm\_bindings.d.ts:152](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L152)

#### Parameters

##### encoded

`string`

#### Returns

`NullifierKey`

***

### random()

> `static` **random**(): [`NullifierKeyPair`](NullifierKeyPair.md)

Defined in: [src/wasm/arm\_bindings.d.ts:150](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/wasm/arm_bindings.d.ts#L150)

#### Returns

[`NullifierKeyPair`](NullifierKeyPair.md)
