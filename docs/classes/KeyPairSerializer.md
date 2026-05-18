[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / KeyPairSerializer

# Class: KeyPairSerializer

Defined in: [src/domain/keys/models.ts:19](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L19)

Utilities for serializing KeyPairBase implementations.

## Constructors

### Constructor

> **new KeyPairSerializer**(): `KeyPairSerializer`

#### Returns

`KeyPairSerializer`

## Methods

### fromJson()

> `static` **fromJson**\<`T`\>(`constructor`, `json`): `T`

Defined in: [src/domain/keys/models.ts:42](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L42)

Deserializes JSON produced by [toJson](#tojson) back into a key pair.

#### Type Parameters

##### T

`T` _extends_ `KeyPairBase`

#### Parameters

##### constructor

`KeyPairConstructor`\<`T`\>

Key pair subclass to instantiate

##### json

`string`

JSON string with fields matching [KeyPairBase.keysName](KeyPair.md#keysname)

#### Returns

`T`

Key pair with private/public keys restored from hex

#### Example

```ts
KeyPairSerializer.fromJson(NullifierKeyPair, keyringObj.nullifierKeyPair);
```

---

### toJson()

> `static` **toJson**\<`T`\>(`keyPair`): `string`

Defined in: [src/domain/keys/models.ts:25](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/keys/models.ts#L25)

Serializes a KeyPairBase subclass into JSON so it can be persisted.

#### Type Parameters

##### T

`T` _extends_ `KeyPairBase`

#### Parameters

##### keyPair

`T`

Instance to serialize

#### Returns

`string`

JSON string containing hex-encoded private/public keys
