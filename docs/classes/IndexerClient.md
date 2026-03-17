[**@anoma/anomapay-sdk**](../README.md)

***

[@anoma/anomapay-sdk](../globals.md) / IndexerClient

# Class: IndexerClient

Defined in: [src/api/IndexerClient.ts:11](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L11)

Generic ApiClient base class

## Extends

- [`ApiClient`](ApiClient.md)

## Constructors

### Constructor

> **new IndexerClient**(`url`): `IndexerClient`

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/ApiClient.ts#L10)

#### Parameters

##### url

`string`

#### Returns

`IndexerClient`

#### Inherited from

[`ApiClient`](ApiClient.md).[`constructor`](ApiClient.md#constructor)

## Properties

### url

> `protected` **url**: `string`

Defined in: [src/api/ApiClient.ts:8](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/ApiClient.ts#L8)

#### Inherited from

[`ApiClient`](ApiClient.md).[`url`](ApiClient.md#url)

## Methods

### addKeys()

> **addKeys**(`keypair`): `Promise`\<`void`\>

Defined in: [src/api/IndexerClient.ts:12](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L12)

#### Parameters

##### keypair

[`EncodedKeypair`](../interfaces/EncodedKeypair.md)

#### Returns

`Promise`\<`void`\>

***

### checkAllowedAddress()

> **checkAllowedAddress**(`address`): `Promise`\<\{ `allowed`: `boolean`; \}\>

Defined in: [src/api/IndexerClient.ts:42](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L42)

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<\{ `allowed`: `boolean`; \}\>

***

### generateProof()

> **generateProof**(`leaf`): `Promise`\<[`ResponseJson`](../type-aliases/ResponseJson.md)\>

Defined in: [src/api/IndexerClient.ts:38](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L38)

#### Parameters

##### leaf

`string`

#### Returns

`Promise`\<[`ResponseJson`](../type-aliases/ResponseJson.md)\>

***

### get()

> `protected` **get**\<`T`\>(`path`, `headers?`): `Promise`\<`T`\>

Defined in: [src/api/ApiClient.ts:25](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/ApiClient.ts#L25)

Generic GET request

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`Promise`\<`T`\>

#### Inherited from

[`ApiClient`](ApiClient.md).[`get`](ApiClient.md#get)

***

### latestRoot()

> **latestRoot**(): `Promise`\<`string`\>

Defined in: [src/api/IndexerClient.ts:34](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L34)

#### Returns

`Promise`\<`string`\>

***

### post()

> `protected` **post**\<`T`, `U`\>(`path`, `props`, `headers?`): `Promise`\<`U`\>

Defined in: [src/api/ApiClient.ts:47](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/ApiClient.ts#L47)

Generic POST request

#### Type Parameters

##### T

`T` = `unknown`

##### U

`U` = `unknown`

#### Parameters

##### path

`string`

##### props

`T`

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`Promise`\<`U`\>

#### Inherited from

[`ApiClient`](ApiClient.md).[`post`](ApiClient.md#post)

***

### resources()

> **resources**(`discoveryPrivateKey`): `Promise`\<[`IndexerResourceResponse`](../type-aliases/IndexerResourceResponse.md)\>

Defined in: [src/api/IndexerClient.ts:16](https://github.com/anoma/anomapay-sdk/blob/824ba013045b822f2227b59fc245bda057b10ef4/src/api/IndexerClient.ts#L16)

#### Parameters

##### discoveryPrivateKey

`string`

#### Returns

`Promise`\<[`IndexerResourceResponse`](../type-aliases/IndexerResourceResponse.md)\>
