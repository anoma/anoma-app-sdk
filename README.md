# Anoma Pay Interface

This repository contains most of the code related to the Anoma Pay interface.

## Tech Stack

- [Vite 7.x](https://vite.dev/guide/)
- [React 19.2](https://react.dev/)
- [Typescript ^5.9](https://www.typescriptlang.org/)
- [TailwindCSS 4.x](https://tailwindcss.com/)
- [GSAP](https://gsap.com/)
- [Jotai](https://jotai.org/)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Tanstack Router](https://tanstack.com/router/latest)
- [Wagmi](https://wagmi.sh/)
- [Viem](http://viem.sh/)
- [Rust](https://doc.rust-lang.org/)
- [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen/)
- [wasm-pack](https://github.com/drager/wasm-pack/)
- [Storybook](https://storybook.js.org/)
- [Playwright](https://playwright.dev/)

## Running Local Build

Requirements (local build only, excludes external services):

- Node.js (>= 22)
- npm (bundled with Node.js)
- Git
- Docker (optional, only if you want containerized dev/prod runs)

Install the dependencies:

```bash
npm install
```

Then build the project:

```bash
npm run build
```

- Production built files are on `/dist` directory

To serve the build locally, you can use the Vite preview feature

```bash
npm run preview
```

- Vite preview server at http://localhost:4173

### Alternatively, running local build with Docker

Production builds bake `VITE_*` values at build time. Rebuild the image after changes.

- `docker compose --profile prod up --build`
- App served by Nginx at http://localhost:4173

## Running Locally

```bash
npm run dev
```

- Vite dev server at http://localhost:5173/

### Alternatively, running locally with Docker

- `docker compose --profile dev up --build`
- Vite dev server at http://localhost:5173/

You can pass CLI env vars and use `--force-recreate`

- `VITE_APP_BACKEND_BASE_URL=https://pay.next.heliax.fyi docker compose --profile dev up -d --force-recreate`

## Configuration

Configuration is via environment variables only.

Environment variables:

| Variable                    | Required | Default                                      | Description                                               |
| --------------------------- | -------- | -------------------------------------------- | --------------------------------------------------------- |
| `VITE_APP_BACKEND_BASE_URL` | Yes      | `https://pay.dev.heliax.fyi`                 | Transfer backend base URL.                                |
| `VITE_APP_INDEXER_BASE_URL` | Yes      | `https://galileo.dev.heliax.fyi`             | Galileo indexer base URL.                                 |
| `VITE_APP_ENVIO_BASE_URL`   | Yes      | `https://hasura.dev.heliax.fyi/v1/graphql`   | Envio GraphQL endpoint base URL.                          |
| `VITE_APP_PERMIT2_ADDRESS`  | Yes      | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | Permit2 contract address for token approvals.             |
| `VITE_APP_CHAIN_ID`         | No       | `8453`                                       | EVM chain ID (Base Mainnet). Must match backend/indexers. |
| `VITE_APP_PRIVATE_BETA`     | No       | `false`                                      | Enables private beta UI gating.                           |
| `PLAYWRIGHT_BASE_URL`       | No       | `http://localhost:5173`                      | E2E test base URL for Playwright.                         |

## External Dependencies for AnomaPay

The UI can render without services, but core flows require external systems. Required dependencies for AnomaPay functionality:

| Dependency                                         | Required For                                                         | Assumptions / Requirements                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Transfer backend API (`VITE_APP_BACKEND_BASE_URL`) | Transfers, fee estimation, queue stats, token prices, token balances | Must implement the REST paths in `src/api/paths.ts` under `TransferBackendPaths`.       |
| Galileo indexer (`VITE_APP_INDEXER_BASE_URL`)      | Resource discovery, proof generation, key storage                    | Must implement the REST paths in `src/api/paths.ts` under `IndexerPaths`.               |
| Envio GraphQL indexer (`VITE_APP_ENVIO_BASE_URL`)  | Nullifier checks                                                     | Must expose `ProtocolAdapter_Transaction` with fields used in `src/api/EnvioClient.ts`. |
| EVM wallet + RPC endpoint                          | On-chain actions and signing                                         | Wallet must be connected to the same chain as `VITE_APP_CHAIN_ID`.                      |
| Permit2 contract on target chain                   | ERC-20 approvals                                                     | `VITE_APP_PERMIT2_ADDRESS` must exist on the configured chain.                          |

## Common Mistakes / Things to Check

- `VITE_APP_CHAIN_ID`, wallet network, backend, and both indexers must all point to the same chain.
- Base URLs must be reachable from the browser (CORS configured on backend/indexers).
- If the UI appears to load but balances/transactions are empty, verify `VITE_APP_INDEXER_BASE_URL` and `VITE_APP_ENVIO_BASE_URL`.
- Docker prod builds bake `VITE_*` values at build time. Rebuild when changing config.
- Docker dev changes require container recreation when setting new CLI env vars.

## How to Create a Release

Releases are configured via GitHub and a Netlify webhook. Merge the commits on the `production` branch to trigger the Netlify build.

Currently, the production version is available on https://beta.anomapay.app

## Running Storybook

Use [Storybook](https://storybook.js.org/) to develop and review UI components in isolation.

```bash
npm run storybook
```

- Storybook server at http://localhost:6006

## Linting

Run ESLint:

```bash
npm run lint
```

## Unit Tests

Run [Vitest](https://vitest.dev/) for unit tests:

```bash
npm run test
```

Run Vitest UI mode:

```bash
npm run test:ui
```

## End-to-End Tests

[Playwright](https://playwright.dev/) e2e tests live under `tests/e2e` and use `PLAYWRIGHT_BASE_URL` from `.env`.
If `PLAYWRIGHT_BASE_URL` is not set, it defaults to `http://localhost:5173`.

Run the E2E tests:

```bash
npm run test:e2e
```

Run Playwright UI mode:

```bash
npm run test:e2e:ui
```

## Project Structure

```
.
├── api       # Files to consume Envio, Indexer and the Backend APIs
├── assets    # Images, icons, and other assets
├── config    # General project configuration files. (e.g. token registry, chains)
├── domain    # Models the AnomaPay domain
│   ├── crypto      # Cryptography services (encrypt, decrypt, etc)
│   ├── keys        # Key hierarchy structure and services
│   ├── resources   # Resource machine handling
│   └── transfer    # Different types of Transfer objects
├── hooks     # General React hooks
├── lib       # Utility and other functions not scoped to a domain
├── providers # React providers components
├── routes    # Tanstack Router page structure (entrypoint of a URL, i.e. /dashboard)
├── store     # Jotai storage atoms / global store
├── ui        # All user interface components
│   ├── components  # Basic components like Buttons, List Items, Containers, etc
│   ├── features    # Composed components containing specific logic
│   ├── layouts     # Pages layouts (e.g. Auth pages, Internal pages, etc)
│   └── stories     # Storybook stories
└── wasm      # Methods to load and consume WASM files from @anoma/lib

```

## Pay Address Format

Anoma Pay uses a custom address format that encodes multiple public keys into a single Base64URL string. The address structure consists of:

| Field                    | Size (bytes) |
| ------------------------ | ------------ |
| Authority Public Key     | 33           |
| Discovery Public Key     | 33           |
| Encryption Public Key    | 33           |
| Nullifier Key Commitment | 32           |
| CRC32 Checksum           | 4            |
| **Total**                | **135**      |

The raw bytes are concatenated in the order shown above and then encoded using Base64URL encoding. The CRC32 checksum at the end provides integrity verification when decoding addresses.

For implementation details, see [`src/lib/payAddress.ts`](./src/lib/payAddress.ts).

## Repository Conventions

- All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard
- Commits that are mostly generated by AI must include the #ai tag in the commit message

## Audits

Our software undergoes regular audits:

1. Informal Systems
   - Company Website: https://informal.systems
   - Commit ID: [957e8bf1e89a824f7c9be911b49533b9da1f5e72](https://github.com/anoma/pay-interface-app/tree/957e8bf1e89a824f7c9be911b49533b9da1f5e72)
   - Started: 2025-12-01
   - Finished: 2025-12-16
   - Last revised: 2025-12-19

   [📄 Audit Report (pdf)](./audits/2025-12-19_Informal_Systems_AnomaPay_Phase_I.pdf)

## Useful Resources

- [Semi-deterministic key hierarchy proposal](https://forum.anoma.net/t/semi-deterministic-key-hierarchy-proposal/2444)
