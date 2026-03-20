---
layout: home

hero:
  name: "AnomaPay SDK"
  text: "Privacy-preserving payments for any app"
  tagline: A TypeScript SDK for building private payment applications powered by the Anoma Resource Machine.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/anoma/anomapay-sdk

features:
  - title: Privacy by default
    details: Transfers are shielded end-to-end. Token balances and transaction graphs are hidden from observers, with cryptographic guarantees enforced on-chain.
  - title: EVM-native
    details: Built on top of ERC-20 tokens and Permit2. Deposits and withdrawals are plain EVM transactions — no new wallets or chains required.
  - title: Simple developer API
    details: Generate keys, build a Pay Address, fetch balances, and submit private transfers with a handful of typed TypeScript calls.
  - title: WebAssembly-powered cryptography
    details: Rust cryptographic primitives compiled to WASM run directly in the browser or Node.js, with no native dependencies.
---
