// Expo iOS and Android (Metro). The generated entry installs the Rust crate on
// import, so its uniffiInitAsync is a no-op kept for parity with the web entries.
export * from "./generated/index.native";
export {
  default,
  uniffiInitAsync as initArmBindings,
} from "./generated/index.native";
