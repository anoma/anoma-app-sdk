[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / WasmNullifierKeyPair

# Class: WasmNullifierKeyPair

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:228

## Constructors

### Constructor

> **new WasmNullifierKeyPair**(`nk`, `cnk`): `NullifierKeyPair`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:234

#### Parameters

##### nk

`NullifierKey`

##### cnk

`NullifierKeyCommitment`

#### Returns

`NullifierKeyPair`

## Properties

### cnk

> **cnk**: `NullifierKeyCommitment`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:236

---

### nk

> **nk**: `NullifierKey`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:237

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:230

#### Returns

`void`

---

### encode()

> **encode**(): `EncodedNullifierKeyPair`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:232

#### Returns

`EncodedNullifierKeyPair`

---

### free()

> **free**(): `void`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:229

#### Returns

`void`

---

### toJson()

> **toJson**(): `any`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:235

#### Returns

`any`

---

### decode()

> `static` **decode**(`encoded`): `NullifierKeyPair`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:231

#### Parameters

##### encoded

`EncodedNullifierKeyPair`

#### Returns

`NullifierKeyPair`

---

### fromJson()

> `static` **fromJson**(`json`): `NullifierKeyPair`

Defined in: src/wasm/armRisc0Bindings/arm_risc0_bindings.d.ts:233

#### Parameters

##### json

`any`

#### Returns

`NullifierKeyPair`
