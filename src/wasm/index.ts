import { default as initLib, initSync as initLibSync } from "./arm_bindings";

/**
 * Provide reference to single wasm init promise
 */
let wasmInstance: Promise<WebAssembly.Module>;
export const initWasm = async (): Promise<WebAssembly.Module> => {
  if (!wasmInstance) {
    wasmInstance = initLib();
  }
  return wasmInstance;
};

/**
 * Re-export initSync
 */
export const initSync = (wasmBytes: Uint8Array) => initLibSync(wasmBytes);
export * from "./arm_bindings";
