[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / ResourceWithLabel

# Class: ResourceWithLabel

Defined in: [src/wasm/arm\_bindings.d.ts:203](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L203)

## Properties

### erc20TokenAddress

> `readonly` **erc20TokenAddress**: `string`

Defined in: [src/wasm/arm\_bindings.d.ts:219](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L219)

Get erc20_token_addr as hex

***

### forwarder

> `readonly` **forwarder**: `string`

Defined in: [src/wasm/arm\_bindings.d.ts:215](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L215)

Get forwarder as hex

***

### resource

> `readonly` **resource**: [`Resource`](Resource.md)

Defined in: [src/wasm/arm\_bindings.d.ts:211](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L211)

Get resource instance

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:206](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L206)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:205](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L205)

#### Returns

`void`

***

### fromEncrypted()

> `static` **fromEncrypted**(`payload`, `sk_bytes`): `ResourceWithLabel`

Defined in: [src/wasm/arm\_bindings.d.ts:207](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/wasm/arm_bindings.d.ts#L207)

#### Parameters

##### payload

`Uint8Array`

##### sk\_bytes

`Uint8Array`

#### Returns

`ResourceWithLabel`
