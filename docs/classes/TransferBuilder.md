[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / TransferBuilder

# Class: TransferBuilder

Defined in: [src/domain/transfer/models/TransferBuilder.ts:10](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferBuilder.ts#L10)

Build required backend Parameters request for mint, transfer, burn

## Constructors

### Constructor

> **new TransferBuilder**(`client`): `TransferBuilder`

Defined in: [src/domain/transfer/models/TransferBuilder.ts:13](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferBuilder.ts#L13)

#### Parameters

##### client

[`TransferLogic`](TransferLogic.md)

#### Returns

`TransferBuilder`

## Properties

### client

> `readonly` **client**: [`TransferLogic`](TransferLogic.md)

Defined in: [src/domain/transfer/models/TransferBuilder.ts:11](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferBuilder.ts#L11)

## Methods

### buildMintParameters()

> **buildMintParameters**(`mintResources`, `permit2Data`, `evmAddress`, `tokenContractAddress`, `keyring`): [`Parameters`](../type-aliases/Parameters.md)

Defined in: [src/domain/transfer/models/TransferBuilder.ts:23](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferBuilder.ts#L23)

Builds the backend Parameters payload for a mint (deposit) transaction.

#### Parameters

##### mintResources

###### consumedResource

`Resource`

###### createdResource

`Resource`

##### permit2Data

[`Permit2Data`](../type-aliases/Permit2Data.md)

##### evmAddress

`` `0x${string}` ``

##### tokenContractAddress

`` `0x${string}` ``

##### keyring

[`UserKeyring`](../type-aliases/UserKeyring.md)

#### Returns

[`Parameters`](../type-aliases/Parameters.md)

---

### init()

> `static` **init**(): `Promise`\<`TransferBuilder`\>

Defined in: [src/domain/transfer/models/TransferBuilder.ts:17](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferBuilder.ts#L17)

#### Returns

`Promise`\<`TransferBuilder`\>
