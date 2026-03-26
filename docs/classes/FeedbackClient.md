[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / FeedbackClient

# Class: FeedbackClient

Defined in: [src/api/FeedbackClient.ts:22](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/FeedbackClient.ts#L22)

API client for the feedback service.

## Extends

- [`ApiClient`](ApiClient.md)\<*typeof* `FeedbackPaths`\[keyof *typeof* `FeedbackPaths`\]\>

## Constructors

### Constructor

> **new FeedbackClient**(`url`): `FeedbackClient`

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L10)

#### Parameters

##### url

`string`

#### Returns

`FeedbackClient`

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

`"/api/v1/feedbacks"` | `` `/api/v1/feedbacks/${string}` ``

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

`"/api/v1/feedbacks"`

##### props

`T`

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`Promise`\<`U`\>

#### Inherited from

[`ApiClient`](ApiClient.md).[`post`](ApiClient.md#post)

***

### submit()

> **submit**(`params`): `Promise`\<`FeedbackResponse`\>

Defined in: [src/api/FeedbackClient.ts:26](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/FeedbackClient.ts#L26)

Submit user feedback.

#### Parameters

##### params

###### description

`string`

###### tag

`string`

###### title

`string`

#### Returns

`Promise`\<`FeedbackResponse`\>
