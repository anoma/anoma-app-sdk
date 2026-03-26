[**@anoma/anoma-app-sdk**](../README.md)

***

[@anoma/anoma-app-sdk](../globals.md) / TransferBackendClient

# Class: TransferBackendClient

Defined in: [src/api/TransferBackendClient.ts:18](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L18)

Generic ApiClient base class

## Extends

- [`ApiClient`](ApiClient.md)

## Constructors

### Constructor

> **new TransferBackendClient**(`url`): `TransferBackendClient`

Defined in: [src/api/ApiClient.ts:10](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L10)

#### Parameters

##### url

`string`

#### Returns

`TransferBackendClient`

#### Inherited from

[`ApiClient`](ApiClient.md).[`constructor`](ApiClient.md#constructor)

## Properties

### url

> `protected` **url**: `string`

Defined in: [src/api/ApiClient.ts:8](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/ApiClient.ts#L8)

#### Inherited from

[`ApiClient`](ApiClient.md).[`url`](ApiClient.md#url)

## Methods

### estimateFee()

> **estimateFee**(`props`): `Promise`\<[`FeeResponse`](../type-aliases/FeeResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:32](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L32)

#### Parameters

##### props

[`FeeRequest`](../type-aliases/FeeRequest.md)

#### Returns

`Promise`\<[`FeeResponse`](../type-aliases/FeeResponse.md)\>

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

### statsQueue()

> **statsQueue**(): `Promise`\<[`StatusQueueResponse`](../type-aliases/StatusQueueResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:48](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L48)

#### Returns

`Promise`\<[`StatusQueueResponse`](../type-aliases/StatusQueueResponse.md)\>

***

### tokenBalances()

> **tokenBalances**(`walletAddress`): `Promise`\<[`TokenBalancesResponse`](../type-aliases/TokenBalancesResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:42](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L42)

#### Parameters

##### walletAddress

`` `0x${string}` ``

#### Returns

`Promise`\<[`TokenBalancesResponse`](../type-aliases/TokenBalancesResponse.md)\>

***

### tokenPrice()

> **tokenPrice**(`tokenAddress`): `Promise`\<[`TokenPriceResponse`](../type-aliases/TokenPriceResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:36](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L36)

#### Parameters

##### tokenAddress

`` `0x${string}` ``

#### Returns

`Promise`\<[`TokenPriceResponse`](../type-aliases/TokenPriceResponse.md)\>

***

### transactionStatus()

> **transactionStatus**(`uuid`): `Promise`\<[`TransactionStatusResponse`](../type-aliases/TransactionStatusResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:26](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L26)

#### Parameters

##### uuid

`` `${string}-${string}-${string}-${string}-${string}` ``

#### Returns

`Promise`\<[`TransactionStatusResponse`](../type-aliases/TransactionStatusResponse.md)\>

***

### transfer()

> **transfer**(`props`): `Promise`\<[`TransactionHashResponse`](../type-aliases/TransactionHashResponse.md)\>

Defined in: [src/api/TransferBackendClient.ts:19](https://github.com/anoma/anoma-app-sdk/blob/3fed919240620868a9ef9a4946a28272083572d4/src/api/TransferBackendClient.ts#L19)

#### Parameters

##### props

[`Parameters`](../type-aliases/Parameters.md)

#### Returns

`Promise`\<[`TransactionHashResponse`](../type-aliases/TransactionHashResponse.md)\>
