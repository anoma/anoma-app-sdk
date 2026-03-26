[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / EnvioClient

# Class: EnvioClient

Defined in: [src/api/EnvioClient.ts:17](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/EnvioClient.ts#L17)

Generic ApiClient base class

## Extends

- [`ApiClient`](ApiClient.md)

## Constructors

### Constructor

> **new EnvioClient**(`url`): `EnvioClient`

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L10)

#### Parameters

##### url

`string`

#### Returns

`EnvioClient`

#### Inherited from

[`ApiClient`](ApiClient.md).[`constructor`](ApiClient.md#constructor)

## Properties

### url

> `protected` **url**: `string`

Defined in: [src/api/ApiClient.ts:8](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L8)

#### Inherited from

[`ApiClient`](ApiClient.md).[`url`](ApiClient.md#url)

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

### publicNullifiers()

> **publicNullifiers**(`logicRef`, `timestamp?`): `Promise`\<[`NullifierRecordResponse`](../type-aliases/NullifierRecordResponse.md)\>

Defined in: [src/api/EnvioClient.ts:19](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/EnvioClient.ts#L19)

#### Parameters

##### logicRef

`string`

##### timestamp?

`number` = `0`

#### Returns

`Promise`\<[`NullifierRecordResponse`](../type-aliases/NullifierRecordResponse.md)\>
