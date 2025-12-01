# Anoma Pay Interface

This repository contains most of the code related to the Anoma Pay interface. For the Rust implementation (@anoma/lib), please refer to the @anoma/pay-js-toolkit repository.

## Tech Stack

- [Vite 7.x](https://vite.dev/guide/)
- [React 19.2](https://react.dev/)
- [Typescript ^5.9](https://www.typescriptlang.org/)
- [TailwindCSS 4.x](https://tailwindcss.com/)
- [GSAP](https://gsap.com/)
- [Jotai](https://jotai.org/)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Tanstack Router](https://tanstack.com/router/latest)
- [Tanstack Form](https://tanstack.com/form/latest)
- [Wagmi](https://wagmi.sh/)
- [Viem](http://viem.sh/)
- [Storybook](https://storybook.js.org/)

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Storybook

Run Storybook for component development:

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006/`

## Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Build Storybook:

```bash
npm run build-storybook
```

## Linting

Run ESLint:

```bash
npm run lint
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

## Useful Resources

- [Semi-deterministic key hierarchy proposal](https://forum.anoma.net/t/semi-deterministic-key-hierarchy-proposal/2444)
