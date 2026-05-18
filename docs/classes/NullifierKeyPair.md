[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / NullifierKeyPair

# Class: NullifierKeyPair

Defined in: [src/domain/keys/models.ts:175](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L175)

Keys used to reflect the right to nullify

## Extends

- `KeyPairBase`

## Constructors

### Constructor

> **new NullifierKeyPair**(`privateKey`, `publicKey`): `NullifierKeyPair`

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

`NullifierKeyPair`

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

> `readonly` `static` **keysName**: `object`

Defined in: [src/domain/keys/models.ts:184](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L184)

#### privateKey

> **privateKey**: `string` = `"nk"`

#### publicKey

> **publicKey**: `string` = `"cnk"`

#### Overrides

`KeyPairBase.keysName`

## Accessors

### cnk

#### Get Signature

> **get** **cnk**(): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:180](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L180)

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

---

### keysName

#### Get Signature

> **get** `protected` **keysName**(): `KeyNames`

Defined in: [src/domain/keys/models.ts:85](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L85)

##### Returns

`KeyNames`

#### Inherited from

`KeyPairBase.keysName`

---

### nk

#### Get Signature

> **get** **nk**(): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:176](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L176)

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

## Methods

### create()

> `static` **create**(`seed?`): `NullifierKeyPair`

Defined in: [src/domain/keys/models.ts:201](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L201)

Creates a nullifier key pair

#### Parameters

##### seed?

`Uint8Array`\<`ArrayBuffer`\>

Optional seed to deterministically derive the key pair

#### Returns

`NullifierKeyPair`

#### Overrides

`KeyPairBase.create`

---

### derivePublicKey()

> `static` **derivePublicKey**(`nk`): `Uint8Array`\<`ArrayBuffer`\>

Defined in: [src/domain/keys/models.ts:193](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L193)

Deterministically derives the nullifier commitment from the private key.

#### Parameters

##### nk

`Uint8Array`\<`ArrayBuffer`\>

Nullifier private key bytes

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
