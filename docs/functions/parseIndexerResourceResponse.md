[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / parseIndexerResourceResponse

# Function: parseIndexerResourceResponse()

> **parseIndexerResourceResponse**(`encryptionPrivateKey`, `resourceResponseCollection`): `Promise`\<`ResourceWithDetails`[]\>

Defined in: [src/domain/resources/services.ts:83](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/domain/resources/services.ts#L83)

Decrypts and deserializes indexer resource payloads using the user's encryption key.

## Parameters

### encryptionPrivateKey

`Uint8Array`\<`ArrayBuffer`\>

### resourceResponseCollection

[`IndexerResource`](../type-aliases/IndexerResource.md)[]

## Returns

`Promise`\<`ResourceWithDetails`[]\>
