import { default as initLib, initSync as initLibSync } from "./anomapay_lib";

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
export * from "./anomapay_lib";
