// Expo web (Metro). The generated entry imports index_bg.wasm as a plain
// asset, so the app's metro.config needs assetExts: ["wasm"].
export * from "./generated/index.web";
export {
  default,
  uniffiInitAsync as initArmBindings,
} from "./generated/index.web";
