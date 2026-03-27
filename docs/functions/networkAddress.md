[**@anomaorg/anoma-app-sdk**](../README.md)

***

[@anomaorg/anoma-app-sdk](../globals.md) / networkAddress

# Function: networkAddress()

> **networkAddress**(`network`, `address`): `` `base:0x${string}` `` \| `` `ethereum:0x${string}` `` \| `` `ethereum-sepolia:0x${string}` `` \| `` `bsc:0x${string}` `` \| `` `unknown:0x${string}` ``

Defined in: [src/lib/tokenUtils.ts:23](https://github.com/anoma/anoma-app-sdk/blob/9ad1dcbfa64ce276a936d2c7679a1c0ec2072734/src/lib/tokenUtils.ts#L23)

Builds a `NetworkAddress` key by combining a network and a normalized EVM address.

## Parameters

### network

`Network`

### address

`` `0x${string}` ``

## Returns

`` `base:0x${string}` `` \| `` `ethereum:0x${string}` `` \| `` `ethereum-sepolia:0x${string}` `` \| `` `bsc:0x${string}` `` \| `` `unknown:0x${string}` ``
