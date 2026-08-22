// Minimal declaration for a runtime global that exists on every supported
// platform (web, React Native, Node) but lives in TypeScript's DOM lib, which
// this package deliberately compiles without.

declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
