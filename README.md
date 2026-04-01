# Anoma Pay SDK

TypeScript SDK for the Anoma Pay protocol. Contains domain logic, API clients, WASM bindings, and utilities shared across Anoma Pay applications.

## Tech Stack

- [TypeScript ~6.0](https://www.typescriptlang.org/)
- [Viem](http://viem.sh/)
- [Zod](https://zod.dev/)
- [Rust](https://doc.rust-lang.org/)
- [wasm-bindgen](https://github.com/nicolo-ribaudo/wasm-bindgen/)
- [wasm-pack](https://github.com/nicolo-ribaudo/wasm-pack/)

## Setup

Requirements:

- Node.js (>= 22)
- npm (bundled with Node.js)
- Rust toolchain (for WASM builds only)

Install dependencies from the repository root:

```bash
npm install
```

## Usage

Import from the SDK using subpath exports:

```typescript
import { TransferBuilder } from "@anomaorg/anoma-pay-sdk/domain/transfer/models/TransferBuilder";
import { formatBalance } from "@anomaorg/anoma-pay-sdk/lib/utils";
import type { AppResource } from "@anomaorg/anoma-pay-sdk/types";
```

## Building WASM

The SDK includes a Rust-based WASM module for cryptographic operations. Build it with:

```bash
npm run build:wasm          # release build
npm run build:wasm:dev      # development build
```

Pre-built WASM binaries are included in `src/wasm/`.

## Pay Address Format

Anoma Pay uses a custom address format that encodes multiple public keys into a single Base64URL string:

| Field                    | Size (bytes) |
| ------------------------ | ------------ |
| Authority Public Key     | 33           |
| Discovery Public Key     | 33           |
| Encryption Public Key    | 33           |
| Nullifier Key Commitment | 32           |
| CRC32 Checksum           | 4            |
| **Total**                | **135**      |

The raw bytes are concatenated in the order shown above and then encoded using Base64URL encoding. The CRC32 checksum provides integrity verification when decoding addresses.

## Audits

Our software undergoes regular audits:

1. Informal Systems
   - Company Website: https://informal.systems
   - Commit ID: [957e8bf1e89a824f7c9be911b49533b9da1f5e72](https://github.com/anoma/pay-interface-app/tree/957e8bf1e89a824f7c9be911b49533b9da1f5e72)
   - Started: 2025-12-01
   - Finished: 2025-12-16
   - Last revised: 2025-12-19

   [Audit Report (pdf)](./audits/2025-12-19_Informal_Systems_AnomaPay_Phase_I.pdf)

## Project Structure

```
src/
├── api           # API clients (Backend, Indexer, Envio)
├── domain        # Core domain logic
│   ├── history       # Transaction history types
│   ├── keys          # Key hierarchy structure and services
│   ├── queue         # Transfer queue management
│   ├── resources     # Resource machine handling
│   └── transfer      # Transfer models and services
├── lib           # Shared utility functions
├── wasm          # WASM bindings and pre-built binaries
├── lib-constants.ts  # SDK-level constants
└── types.ts      # Shared type definitions
```

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run tsc-check
```

## Unit Tests

```bash
npm run test        # watch mode
npm run test:run    # single run
```

## Repository Conventions

- All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard
