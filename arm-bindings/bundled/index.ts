// Mirrors ../generated/index.web.ts for bundlers that cannot compile its
// TypeScript — keep the two in step. It reaches the wasm by asset import,
// this one by URL, resolved at runtime from the emitted dist/index.js and so
// a level deeper than the imports below. `pnpm smoke` guards that depth.

import * as arm_bindings from "../generated/web/arm_bindings";
import initAsync from "../generated/web/wasm-bindgen/index.js";

export * from "../generated/web/arm_bindings";

export async function initArmBindings() {
  const wasmUrl = new URL(
    "../../generated/web/wasm-bindgen/index_bg.wasm",
    import.meta.url
  );
  await initAsync({ module_or_path: wasmUrl });
  arm_bindings.default.initialize();
}

export default {
  arm_bindings,
};
