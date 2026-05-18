[**@anomaorg/anoma-app-sdk**](../README.md)

---

[@anomaorg/anoma-app-sdk](../globals.md) / normalizeEvmAddress

# Function: normalizeEvmAddress()

> **normalizeEvmAddress**(`address`): `` `0x${string}` ``

Defined in: [src/lib/utils.ts:29](https://github.com/anoma/anoma-app-sdk/blob/7493b5063eb09a66e10004d752f7592cd373f80c/src/lib/utils.ts#L29)

Normalizes an EVM address by lowercasing it and ensuring it has a "0x" prefix.

## Parameters

### address

`string`

The raw address string.

## Returns

`` `0x${string}` ``

A valid checksummed `Address`.
