import { promiseWithResolvers } from "lib/utils";
import { default as initLib, initSync as initLibSync } from "./arm_bindings";

/**
 * Provide reference to single wasm init promise
 */
let isInitialized = false;
const [initPromise, initResolver] = promiseWithResolvers<WebAssembly.Module>();

export const initWasm = async (): Promise<WebAssembly.Module> => {
  if (!isInitialized) {
    const module = await initLib().then(module => {
      return module;
    });
    isInitialized = true;
    initResolver(module);
  }
  return initPromise;
};

/**
 * Re-export initSync
 */
export const initSync = (wasmBytes: Uint8Array) => initLibSync(wasmBytes);
export * from "./arm_bindings";
