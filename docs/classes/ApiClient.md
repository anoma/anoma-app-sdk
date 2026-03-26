[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / ApiClient

# Class: ApiClient\<P\>

Defined in: [src/api/ApiClient.ts:7](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L7)

Generic ApiClient base class

## Extended by

- [`EnvioClient`](EnvioClient.md)
- [`FeedbackClient`](FeedbackClient.md)
- [`IndexerClient`](IndexerClient.md)
- [`TransferBackendClient`](TransferBackendClient.md)

## Type Parameters

### P

`P` *extends* `string` = `string`

## Constructors

### Constructor

> **new ApiClient**\<`P`\>(`url`): `ApiClient`\<`P`\>

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L10)

#### Parameters

##### url

`string`

#### Returns

`ApiClient`\<`P`\>

## Properties

### url

> `protected` **url**: `string`

Defined in: [src/api/ApiClient.ts:8](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L8)

## Methods

### get()

> `protected` **get**\<`T`\>(`path`, `headers?`): `Promise`\<`T`\>

Defined in: [src/api/ApiClient.ts:25](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L25)

Generic GET request

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`P` | `` `${P}/${string}` ``

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`Promise`\<`T`\>

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

`P`

##### props

`T`

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`Promise`\<`U`\>
