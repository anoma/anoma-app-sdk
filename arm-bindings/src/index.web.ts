// Metro (Expo web) resolves this over index.ts via platform extensions.
// The generated entry's plain .wasm import works there with assetExts: ['wasm'].

import { uniffiInitAsync } from "../generated/index.web";

export * from '../generated/index.web';
export { default } from '../generated/index.web';

export async function initSdk() {
  return await uniffiInitAsync()
}
