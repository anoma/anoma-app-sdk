[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / ResourceWithLabel

# Class: ResourceWithLabel

Defined in: [src/wasm/arm\_bindings.d.ts:204](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L204)

## Properties

### erc20TokenAddress

> `readonly` **erc20TokenAddress**: `string`

Defined in: [src/wasm/arm\_bindings.d.ts:220](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L220)

Get erc20_token_addr as hex

***

### forwarder

> `readonly` **forwarder**: `string`

Defined in: [src/wasm/arm\_bindings.d.ts:216](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L216)

Get forwarder as hex

***

### resource

> `readonly` **resource**: [`Resource`](Resource.md)

Defined in: [src/wasm/arm\_bindings.d.ts:212](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L212)

Get resource instance

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:207](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L207)

#### Returns

`void`

***

### free()

> **free**(): `void`

Defined in: [src/wasm/arm\_bindings.d.ts:206](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L206)

#### Returns

`void`

***

### fromEncrypted()

> `static` **fromEncrypted**(`payload`, `sk_bytes`): `ResourceWithLabel`

Defined in: [src/wasm/arm\_bindings.d.ts:208](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/wasm/arm_bindings.d.ts#L208)

#### Parameters

##### payload

`Uint8Array`

##### sk\_bytes

`Uint8Array`

#### Returns

`ResourceWithLabel`
