[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / KeyPair

# Class: KeyPair

Defined in: [src/domain/keys/models.ts:135](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L135)

Standard secp256k1 key pair used for authority, encryption, and discovery.

## Extends

- `KeyPairBase`

## Constructors

### Constructor

> **new KeyPair**(`privateKey`, `publicKey`): `KeyPair`

Defined in: [src/domain/keys/models.ts:124](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L124)

Instantiates the KeyPair object

#### Parameters

##### privateKey

`Uint8Array`\<`ArrayBuffer`\>

Private key bytes

##### publicKey

`Uint8Array`\<`ArrayBuffer`\>

Public key bytes

#### Returns

`KeyPair`

#### Inherited from

`KeyPairBase.constructor`

## Properties

### keys

> `readonly` **keys**: `object`

Defined in: [src/domain/keys/models.ts:75](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L75)

#### privateKey

> **privateKey**: `Uint8Array`\<`ArrayBuffer`\>

#### publicKey

> **publicKey**: `Uint8Array`\<`ArrayBuffer`\>

#### Inherited from

`KeyPairBase.keys`

---

### keysName

> `readonly` `static` **keysName**: `KeyNames`

Defined in: [src/domain/keys/models.ts:80](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L80)

#### Inherited from

`KeyPairBase.keysName`

## Accessors

### keysName

#### Get Signature

> **get** `protected` **keysName**(): `KeyNames`

Defined in: [src/domain/keys/models.ts:85](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L85)

##### Returns

`KeyNames`

#### Inherited from

`KeyPairBase.keysName`

---

### privateKey

#### Get Signature

> **get** **privateKey**(): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:136](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L136)

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

---

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:140](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L140)

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

## Methods

### sign()

> **sign**(`message`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [src/domain/keys/models.ts:148](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L148)

Generates deterministic-k ECDSA signature

#### Parameters

##### message

`string`

Message to sign

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

---

### create()

> `static` **create**(`seed?`, `domain?`): `KeyPair`

Defined in: [src/domain/keys/models.ts:165](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L165)

Creates a standard secp256k1 key pair optionally scoped by domain.

#### Parameters

##### seed?

`Uint8Array`\<`ArrayBuffer`\>

Optional seed to deterministically derive the key pair

##### domain?

`"Authority"` \| `"Nullifier"` \| `"Encryption"` \| `"Discovery"`

Domain identifier from [PRFDomain](../type-aliases/PRFDomain.md)

#### Returns

`KeyPair`

#### Overrides

`KeyPairBase.create`

---

### derivePublicKey()

> `static` **derivePublicKey**(`privateKey`): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:156](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L156)

Derives the compressed secp256k1 public key for the provided private key.

#### Parameters

##### privateKey

`Uint8Array`\<`ArrayBuffer`\>

Private key bytes

#### Returns

`Uint8Array`\<`ArrayBuffer`\>

#### Overrides

`KeyPairBase.derivePublicKey`

---

### generatePrivateKey()

> `static` **generatePrivateKey**(`seed?`, `domain?`): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:108](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L108)

Generates a private key using PRF with the provided seed and domain.

#### Parameters

##### seed?

`Uint8Array`\<`ArrayBuffer`\>

Optional seed; random bytes are used when absent

##### domain?

`"Authority"` \| `"Nullifier"` \| `"Encryption"` \| `"Discovery"`

PRF domain to separate derivations

#### Returns

`Uint8Array`\<`ArrayBuffer`\>

Derived 32-byte private key

#### Inherited from

`KeyPairBase.generatePrivateKey`
