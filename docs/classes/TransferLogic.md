[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / TransferLogic

# Class: TransferLogic

Defined in: [src/domain/transfer/models/TransferLogic.ts:26](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L26)

Transfer client which provies the necessary resource logic for
Anoma Simple Transfer Application

## Constructors

### Constructor

> **new TransferLogic**(): `TransferLogic`

#### Returns

`TransferLogic`

## Methods

### createBurnResource()

> **createBurnResource**(`__namedParameters`): `Resource`

Defined in: [src/domain/transfer/models/TransferLogic.ts:92](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L92)

Creates a burn (unwrap) resource destined for an EVM wallet address.

#### Parameters

##### \_\_namedParameters

###### forwarderAddress

`` `0x${string}` ``

###### nullifierKey

`NullifierKey`

###### quantity

`bigint`

###### receiverAddress

`string`

###### resource

`Resource`

###### token

`` `0x${string}` ``

#### Returns

`Resource`

---

### createMintResources()

> **createMintResources**(`props`): [`MintResources`](../type-aliases/MintResources.md)

Defined in: [src/domain/transfer/models/TransferLogic.ts:123](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L123)

Creates a consumed/created resource pair for minting tokens into the Anoma shielded pool.

#### Parameters

##### props

[`CreateMintProps`](../type-aliases/CreateMintProps.md)

#### Returns

[`MintResources`](../type-aliases/MintResources.md)

---

### createPaddingResource()

> **createPaddingResource**(`props?`): `Resource`

Defined in: [src/domain/transfer/models/TransferLogic.ts:32](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L32)

#### Parameters

##### props?

###### nullifierKey

`NullifierKey`

###### resource

`Resource`

#### Returns

`Resource`

---

### createTransferResource()

> **createTransferResource**(`__namedParameters`): `Resource`

Defined in: [src/domain/transfer/models/TransferLogic.ts:55](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L55)

Creates a transfer resource destined for an Anoma address receiver.

#### Parameters

##### \_\_namedParameters

###### forwarderAddress

`` `0x${string}` ``

###### nullifierKey

`NullifierKey`

###### quantity

`bigint`

###### receiverKeyring

[`UserPublicKeys`](../type-aliases/UserPublicKeys.md)

###### resource

`Resource`

###### token

`` `0x${string}` ``

#### Returns

`Resource`

---

### init()

> `static` **init**(): `Promise`\<`TransferLogic`\>

Defined in: [src/domain/transfer/models/TransferLogic.ts:27](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/transfer/models/TransferLogic.ts#L27)

#### Returns

`Promise`\<`TransferLogic`\>
