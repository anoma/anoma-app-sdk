# Installation

## Requirements

| Requirement | Version |
| --- | --- |
| Node.js | `>= 22` |
| npm | bundled with Node.js |

## Install the package

```bash
npm install @anonma/anomapay-sdk
```

## Peer dependencies

The SDK ships with everything it needs. There are no required peer dependencies for the SDK's core functionality.

If you are building a React application, you will also need [wagmi](https://wagmi.sh/) and [viem](https://viem.sh/) for wallet interactions and EVM signing:

```bash
npm install wagmi viem
```

## WebAssembly

The SDK's cryptography layer is compiled from Rust to WebAssembly. The WASM module is bundled inside the package and loaded automatically on first use via `initWasm()`. No extra build configuration is required for most bundlers (Vite, webpack, esbuild).

::: tip Node.js usage
When running in Node.js (e.g. in tests or a server-side script), WASM loading works out of the box on Node.js 22+.
:::

## Verify your installation

```ts
import { createUserKeyring, encodePayAddress, extractUserPublicKeys } from "@anonma/anomapay-sdk";

const keyring = createUserKeyring();
const payAddress = encodePayAddress(extractUserPublicKeys(keyring));

console.log(payAddress); // AP_...
```
