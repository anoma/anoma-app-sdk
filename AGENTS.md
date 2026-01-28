# Project Structure

- [REQUIRED | FIRST RUN ONLY]
  On the first interaction with the project, read the following sections in `README.md`:
  **Tech Stack**, **Project Structure**, **Audits**, **Useful Resources**.

- [REQUIRED | FIRST RUN ONLY]
  Read the contents of .NOTES to get up to date with information saved about the project

- [REQUIRED]
  You must be proficient in all technologies listed in the **Tech Stack** section.
  If a task requires unfamiliar technology, explicitly state the limitation before proceeding.

- [REQUIRED]
  All code must prioritize:
  - Clarity over cleverness
  - Maintainability over brevity
  - Explicitness over inference
  - Avoid excessive comments, prefer code readability

---

# Coding Guidelines

## Configuration Awareness

- [REQUIRED | FIRST RUN ONLY]
  Review `/tsconfig.app.json` to understand TypeScript compiler constraints.
  Do not modify this file unless explicitly instructed.

- [REQUIRED | FIRST RUN ONLY]
  Review `/eslint.config.js` to understand enforced code standards.

- [REQUIRED | FIRST RUN ONLY]
  Review `/.example.tsx` to learn canonical React component patterns used in this project.

---

## Validation & Tooling

- [REQUIRED]
  After **any** code change:
  - Run `npm run lint`
  - Fix **all** ESLint errors before proceeding

- [REQUIRED]
  Run `npm run tsc-check`.
  Resolve TypeScript errors incrementally as they appear.

- [REQUIRED]
  Run `npm run build`.
  Resolve TypeScript build errors.

- [REQUIRED]
  Run tests using `npm run test` before considering a task complete.

---

## Testing Rules

- [REQUIRED]
  Any behavior change **must** include a test.

- [REQUIRED]
  Testing stack:
  - **Vitest** → unit & integration tests
  - **React Testing Library** → integration tests
  - **Playwright** → end-to-end tests

---

## TypeScript Rules

- [FORBIDDEN]
  Never use the `any` type.

- [DISCOURAGED | EXCEPTIONAL USE ONLY]
  Avoid `unknown` unless there is a clear and documented reason.

- [REQUIRED]
  Prefer proper type definitions over type assertions (`as`, `!`).

- [REQUIRED]
  Avoid implicit type widening (e.g., untyped object literals).

- [REQUIRED]
  Prefer `satisfies` over `as` when validating object shapes.

- [REQUIRED]
  Reuse existing types whenever possible.

- [REQUIRED]
  New types may be added to `/src/types.ts` (or imported there)
  **only if** existing types are demonstrably insufficient.

- [FORBIDDEN]
  Avoid using `enum` in TypeScript.

---

## Code Style & Documentation

- [REQUIRED]
  Document all functions using the JSDoc standard.

- [REQUIRED]
  When modifying a function:
  - Update its existing documentation, or
  - Add documentation if it does not exist

- [PREFERRED]
  Use early returns to improve readability and reduce nesting.

---

## Error Handling & Security

- [REQUIRED]
  Never expose sensitive information in errors or logs.

- [REQUIRED]
  Errors returned to users **must** be sanitized.

---

## Code Review Behavior

- [REQUIRED]
  Apply **all** rules in this document when reviewing pull requests.

- [REQUIRED]
  Do not approve code that violates:
  - TypeScript rules
  - Testing requirements
  - Security constraints

---

# General Guidelines

- [REQUIRED]
  Save any important information related to the current execution in /.NOTES that may assist with intermediate reasoning and future executions.

- [INFO]
  This file:
  - Does not need to be human-readable
  - Has no size constraints
  - Is ignored by version control

---

# Non-Goals

- [FORBIDDEN]
  Do not refactor unrelated code.

- [FORBIDDEN]
  Do not introduce new abstractions unless they:
  - Reduce duplication, or
  - Reduce cognitive complexity

- [FORBIDDEN]
  Do not change public APIs without explicit approval.
