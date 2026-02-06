# Anoma Pay Interface — Agent Instructions

## Onboarding

- [REQUIRED | FIRST RUN ONLY]
  Read `README.md` sections: **Tech Stack**, **Project Structure**, **Audits**, **Useful Resources**.

- [REQUIRED | FIRST RUN ONLY]
  Read `/.NOTES` for accumulated project context from previous sessions.

- [REQUIRED | FIRST RUN ONLY]
  Read `/.example.tsx` to learn the canonical React component pattern.

- [REQUIRED | FIRST RUN ONLY]
  Review `/tsconfig.app.json` and `/eslint.config.js` for compiler and lint constraints.
  Do not modify these files unless explicitly instructed.

- [REQUIRED]
  You must be proficient in all technologies in the **Tech Stack** section.
  If a task requires unfamiliar technology, state the limitation before proceeding.

---

## Architecture

This is a domain-driven React application for privacy-preserving payments on the Anoma protocol.

### Directory Map (`src/`)

| Directory       | Purpose                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `api/`          | API clients (`ApiClient` base class, `TransferBackendClient`, `IndexerClient`, `EnvioClient`) |
| `config/`       | App config (`app.ts`), token registry, chain settings, wagmi config                           |
| `domain/`       | Business logic — **never import UI or hooks here**                                            |
| ├ `crypto/`     | Vault encryption/decryption (WebAuthn, passkeys)                                              |
| ├ `keys/`       | Key pair models (`KeyPair`, `NullifierKeyPair`) and derivation services                       |
| ├ `resources/`  | Resource encoding/decoding                                                                    |
| ├ `transfer/`   | Transfer logic, resource splitting, authorization                                             |
| ├ `vault/`      | Vault storage types                                                                           |
| └ `queue/`      | Transaction queue management                                                                  |
| `hooks/`        | Custom React hooks (data fetching, forms, auth, wallet)                                       |
| `lib/`          | Pure utility functions (`utils.ts`, `forms.ts`, `payAddress.ts`)                              |
| `providers/`    | `AnomaProvider` + `AnomaContext` — app-wide dependency injection                              |
| `routes/`       | TanStack Router file-based routes                                                             |
| `schemas/`      | Zod validation schemas                                                                        |
| `store/`        | Jotai atoms for global state                                                                  |
| `ui/`           | All visual components                                                                         |
| ├ `components/` | Reusable primitives (Button, Input, Modal, etc.)                                              |
| ├ `features/`   | Composed components with business logic (forms, modals, pages)                                |
| ├ `icons/`      | Icon components                                                                               |
| ├ `layouts/`    | Page layout shells (Auth layout, App layout)                                                  |
| └ `stories/`    | Storybook stories                                                                             |
| `wasm/`         | WASM client initialization from `arm-bindings`                                                |

### Dependency Direction

```
routes → ui/features → ui/components
  ↓         ↓
hooks → domain → wasm
  ↓         ↓
store     api
  ↓
lib (pure utilities, no side effects)
```

**Rules:**

- `domain/` must not import from `hooks/`, `ui/`, `routes/`, or `store/`
- `lib/` must not import from any project module
- `ui/components/` must not import from `ui/features/`
- `store/` atoms must not import from `ui/` or `routes/`

---

## Code Principles

- [REQUIRED] Clarity over cleverness. Maintainability over brevity. Explicitness over inference.
- [REQUIRED] Avoid excessive comments — prefer code readability. Comments explain "why", not "what".

---

## Imports

- [REQUIRED] Use **absolute imports** from `src/` root. The `baseUrl` is `./src`.

  ```typescript
  // Correct
  import { Button } from "ui/components/Button";
  import { useTransferForm } from "hooks/useTransferForm";
  import type { TokenRegistry } from "types";

  // Wrong — no relative imports across directories
  import { Button } from "../../ui/components/Button";
  ```

- [REQUIRED] Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`).
  ```typescript
  import type { Address } from "viem";
  ```

---

## Component Patterns

- [REQUIRED] Follow the pattern in `/.example.tsx`:
  - File named `ComponentName.tsx`, default export matches filename
  - Props type named `<ComponentName>Props`, **not exported**
  - Always destructure props in function signature
  - Create custom hooks for React Query usages (see `src/hooks/`)

  ```typescript
  import type { Address } from "viem";

  type MyComponentProps = {
    address: Address;
    label: string;
  };

  export const MyComponent = ({ address, label }: MyComponentProps) => {
    return <div>{label}: {address}</div>;
  };
  ```

- [REQUIRED] For styled components, use `tailwind-variants` (`tv()`) for variant definitions.
  See `src/ui/components/Button.tsx` for the canonical example.

- [REQUIRED] Use `cn()` from `lib/utils` for conditional class merging (wraps `clsx` + `twMerge`).

---

## State Management (Jotai)

- [REQUIRED] Global state lives in `src/store/` as Jotai atoms.
- [REQUIRED] Use `atomWithStorage` for persistent state (session/local storage).
- [REQUIRED] Read atoms with `useAtomValue`, write with `useSetAtom`, both with `useAtom`.
- [REQUIRED] Import from `jotai/react` (not bare `jotai`).
  ```typescript
  import { useAtomValue } from "jotai/react";
  import { decryptedVaultAtom } from "store/keyring";
  ```

---

## Routing (TanStack Router)

- [REQUIRED] Routes live in `src/routes/` using file-based routing.
- [INFO] `_auth/` = unauthenticated layout group. `_authenticated/` = protected layout group.
- [INFO] `$param` segments are dynamic route parameters.
- [INFO] Auto code-splitting is enabled via the TanStack Router Vite plugin.

---

## Data Fetching (TanStack React Query)

- [REQUIRED] All data fetching must go through custom hooks in `src/hooks/` using `useQuery` or `useMutation`.
- [REQUIRED] Hook naming: `use<Action><Entity>` (e.g., `useAggregatedTokenBalances`, `useResourcesList`).
- [REQUIRED] Always provide meaningful `queryKey` arrays for cache identity.
- [REQUIRED] Use `enabled` option to gate queries on prerequisite data.
  ```typescript
  return useQuery({
    queryKey: ["useAggregatedTokenBalances", resourcesKey],
    queryFn: async () => {
      /* ... */
    },
    enabled: Boolean(resources.isSuccess && keyring),
  });
  ```

---

## API Layer

- [REQUIRED] API clients extend `ApiClient` base class in `src/api/ApiClient.ts`.
- [REQUIRED] Use `ResponseError` (from `src/api/types.ts`) for API error handling.
- [INFO] Three backends: `TransferBackendClient`, `IndexerClient`, `EnvioClient` (GraphQL).
- [INFO] Config is loaded from `import.meta.env.VITE_APP_*` variables, centralized in `config/app.ts`.

---

## Form Validation (Zod)

- [REQUIRED] Validation schemas live in `src/schemas/`.
- [REQUIRED] Reuse validation primitives from `src/schemas/validations.ts` (`validAddress`, `validFormattedAmount`, etc.).
- [REQUIRED] Use `.transform()` and `.refine()` for domain-specific validation logic.
- [REQUIRED] Extract first error message with `getFirstErrorMessage()` from `lib/forms.ts`.

---

## Error Handling

- [REQUIRED] Never expose sensitive information in errors or logs.
- [REQUIRED] Errors returned to users **must** be sanitized.
- [REQUIRED] Use `ErrorMessageHandler` component for rendering user-facing errors.
  It handles EIP-1193 wallet errors, DOM exceptions, and generic error objects.
- [REQUIRED] Use `getFirstErrorMessage()` from `lib/forms.ts` to extract displayable messages from `ResponseError`, `ZodError`, or generic `Error` objects.

---

## Domain Layer

- [REQUIRED] Domain code in `src/domain/` must be **pure business logic** — no React, no UI, no side effects.
- [INFO] Key concepts:
  - **UserKeyring**: Authority, Discovery, Encryption, and Nullifier key pairs
  - **Vault**: Encrypted storage of keyring, unlocked with WebAuthn/passkey signatures
  - **Resources**: Encoded representations of token ownership (privacy-preserving)
  - **Transfer**: Cryptographic operations for sending/receiving resources
- [REQUIRED] Use `invariant()` from `lib/utils` for runtime assertions in domain logic.

---

## WASM Integration

- [INFO] WASM bindings are in `arm-bindings/` (compiled from `@anoma/lib` Rust crate).
- [REQUIRED] Always initialize WASM before use via `initWasm()` or the `initClient()` helper.
- [REQUIRED] WASM-dependent classes use the async `ClassName.init()` factory pattern.

  ```typescript
  // Correct
  const transfer = await Transfer.init();

  // Wrong — constructor requires digest from WASM
  const transfer = new Transfer();
  ```

---

## TypeScript Rules

- [FORBIDDEN] Never use the `any` type.
- [FORBIDDEN] Never use `enum`. Use `as const` arrays + derived types instead:
  ```typescript
  export const TRANSACTION_STATUS = ["sent", "sending", "received"] as const;
  export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];
  ```
- [DISCOURAGED] Avoid `unknown` unless there is a clear and documented reason.
- [REQUIRED] Prefer `satisfies` over `as` when validating object shapes.
- [REQUIRED] Prefer proper type definitions over type assertions (`as`, `!`).
- [REQUIRED] Avoid implicit type widening (e.g., untyped object literals).
- [REQUIRED] Reuse existing types. New types go in `/src/types.ts` **only if** existing types are insufficient.
- [INFO] Unused vars prefixed with `_` are allowed (ESLint rule: `argsIgnorePattern: "^_"`).

---

## Styling (TailwindCSS v4)

- [REQUIRED] Use TailwindCSS utility classes for all styling.
- [REQUIRED] Use `tailwind-variants` (`tv()`) for reusable component variant styles.
- [REQUIRED] Use `cn()` (from `lib/utils`) for conditional class composition.
- [FORBIDDEN] Do not use inline `style` attributes unless absolutely necessary for dynamic values not expressible in Tailwind.

---

## Code Style & Documentation

- [REQUIRED] Document all functions using JSDoc.
- [REQUIRED] When modifying a function: update its existing docs or add docs if missing.
- [PREFERRED] Use early returns to improve readability and reduce nesting.
- [REQUIRED] Naming conventions:
  - **Components**: PascalCase file and export (`Button.tsx` → `export const Button`)
  - **Props types**: `<ComponentName>Props` (not exported)
  - **Hooks**: `use<Name>` (`useTransferForm.tsx`)
  - **Utilities**: camelCase (`formatBalance`, `shortenAddress`)
  - **Constants**: UPPER_SNAKE_CASE (`PERMIT2_DEADLINE_OFFSET_MILLISECONDS`)
  - **Types/Interfaces**: PascalCase (`TokenRegistry`, `ChainSettings`)

---

## Validation & Tooling

- [REQUIRED] After **any** code change, run in order:
  1. `npm run lint` — fix **all** ESLint errors
  2. `npm run tsc-check` — resolve TypeScript errors
  3. `npm run build` — verify production build
  4. `npm run test:run` — run unit/integration tests

- [INFO] Additional commands:
  - `npm run test:e2e` — Playwright E2E tests (requires running dev server or `PLAYWRIGHT_BASE_URL`)
  - `npm run storybook` — component development on port 6006
  - `npm run format` — Prettier formatting

---

## Testing Rules

- [REQUIRED] Any behavior change **must** include a test.
- [REQUIRED] Testing stack:
  - **Vitest** (`*.test.ts`) → unit & integration tests (config: `vitest.config.ts`)
  - **React Testing Library** → component integration tests
  - **Playwright** (`tests/e2e/*.spec.ts`) → end-to-end tests

- [REQUIRED] Unit tests go next to their source or in a `tests/` subdirectory within the module.
  - Example: `src/domain/keys/tests/keys-service.test.ts`
- [REQUIRED] E2E tests go in `tests/e2e/` and use custom fixtures from `tests/e2e/fixtures.ts`.
- [REQUIRED] Vitest config uses `jsdom` environment and `globals: true` — no need to import `describe`/`it`.

---

## Git & Commits

- [REQUIRED] All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- [REQUIRED] AI-generated commits must include `#ai` in the commit message.
- [INFO] Husky pre-commit hooks are configured — do not bypass with `--no-verify`.

---

## Code Review Behavior

- [REQUIRED] Apply **all** rules in this document when reviewing pull requests.
- [REQUIRED] Do not approve code that violates TypeScript rules, testing requirements, or security constraints.

---

## Session Notes

- [REQUIRED] Save important information from the current session in `/.NOTES`.
- [INFO] `.NOTES` does not need to be human-readable, has no size constraints, and is gitignored.

---

## Non-Goals

- [FORBIDDEN] Do not refactor unrelated code.
- [FORBIDDEN] Do not introduce new abstractions unless they reduce duplication or cognitive complexity.
- [FORBIDDEN] Do not change public APIs without explicit approval.
