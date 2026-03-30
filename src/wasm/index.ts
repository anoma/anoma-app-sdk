import { default as initLib, initSync as initLibSync } from "wasm/arm_bindings";

/**
 * Provide reference to single wasm init promise
 */
let wasmInstance: Promise<WebAssembly.Module>;
export const initWasm = async (url?: string): Promise<WebAssembly.Module> => {
  if (!wasmInstance) {
    wasmInstance = initLib(url);
  }
  return wasmInstance;
};

/**
 * Re-export initSync
 */
export const initSync = (wasmBytes: Uint8Array) => initLibSync(wasmBytes);
export * from "./arm_bindings";
