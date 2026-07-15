// Web entry for standard bundlers (Vite, webpack, Rollup).
// Metro resolves ./index.web.ts (Expo web) or ../index.native.ts (native) instead.

import * as arm_bindings from '../generated/wasm/arm_bindings';
import initAsync from '../generated/wasm/wasm-bindgen/index.js';

export * from '../generated/wasm/arm_bindings';

export async function initSdk() {
  // Reference the wasm as an asset URL instead of importing it, so bundlers
  // don't attempt WebAssembly ES-module integration on the binary.
  const wasmUrl = new URL(
    '../generated/wasm/wasm-bindgen/index_bg.wasm',
    import.meta.url,
  );
  await initAsync({ module_or_path: wasmUrl });

  // Initialize the generated bindings: mostly checksums, but also callbacks.
  arm_bindings.default.initialize();
}

// Export the crates as individually namespaced objects.
export default {
  arm_bindings,
};
