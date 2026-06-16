import { default as initLib, initSync as initLibSync } from "./arm_bindings";

/**
 * Provide reference to single wasm init promise
 *
 * Optionally accepts the bytes of a wasm file, as clients
 * will generally be responsible for fetching the wasm
 * itself, as the compiled library is too large to make
 * inlining efficient. The `package.json` defines an export
 * to this wasm file, so build pipelines such as Vite can
 * fetch this via `@anomaorg/anoma-app-sdk/anomaPayArm.wasm?url`.
 */
let wasmInstance: Promise<WebAssembly.Module>;
export const initWasm = async (
  wasmBytes?: Uint8Array
): Promise<WebAssembly.Module> => {
  if (!wasmInstance) {
    if (wasmBytes) {
      wasmInstance = Promise.resolve(initSync(wasmBytes));
    } else {
      wasmInstance = initLib();
    }
  }
  return wasmInstance;
};

/**
 * Re-export initSync
 */
export const initSync = (wasmBytes: Uint8Array) => initLibSync(wasmBytes);
export * from "./arm_bindings";
