[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / IndexerClient

# Class: IndexerClient

Defined in: [src/api/IndexerClient.ts:12](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/IndexerClient.ts#L12)

Generic ApiClient base class

## Extends

- [`ApiClient`](ApiClient.md)

## Constructors

### Constructor

> **new IndexerClient**(`url`): `IndexerClient`

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L10)

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

Defined in: [src/api/ApiClient.ts:8](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L8)

#### Inherited from

[`ApiClient`](ApiClient.md).[`url`](ApiClient.md#url)

## Methods

### addKeys()

> **addKeys**(`keypair`): `Promise`\<[`IndexerAddKeysResponse`](../type-aliases/IndexerAddKeysResponse.md)\>

Defined in: [src/api/IndexerClient.ts:17](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/IndexerClient.ts#L17)

#### Parameters

##### keypair

###### public_key

`` `0x${string}` ``

###### secret_key

`` `0x${string}` ``

#### Returns

`Promise`\<[`IndexerAddKeysResponse`](../type-aliases/IndexerAddKeysResponse.md)\>

***

### config()

> **config**(): `Promise`\<[`IndexerHealthResponse`](../type-aliases/IndexerHealthResponse.md)\>

Defined in: [src/api/IndexerClient.ts:13](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/IndexerClient.ts#L13)

#### Returns

`Promise`\<[`IndexerHealthResponse`](../type-aliases/IndexerHealthResponse.md)\>

***

### get()

> `protected` **get**\<`T`\>(`path`, `headers?`): `Promise`\<`T`\>

Defined in: [src/api/ApiClient.ts:25](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L25)

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

### post()

> `protected` **post**\<`T`, `U`\>(`path`, `props`, `headers?`): `Promise`\<`U`\>

Defined in: [src/api/ApiClient.ts:47](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L47)

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

> **resources**(`discoveryPrivateKey`, `contracts`): `Promise`\<[`IndexerResourceResponse`](../type-aliases/IndexerResourceResponse.md)\>

Defined in: [src/api/IndexerClient.ts:27](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/IndexerClient.ts#L27)

#### Parameters

##### discoveryPrivateKey

`` `0x${string}` ``

##### contracts

[`IndexerContract`](../type-aliases/IndexerContract.md)[]

#### Returns

`Promise`\<[`IndexerResourceResponse`](../type-aliases/IndexerResourceResponse.md)\>
