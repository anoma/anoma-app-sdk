import { execSync } from "child_process";
import { parseArgs } from "util";

/**
 * This build script supports the "anoma" Cargo workspace:
 *
 * - wasm32-unknown-unknown (lib) - Shared lib (with JS bindings and types)
 */
const argsOptions = {
  release: {
    type: "boolean",
    short: "r",
  },
};
const { release = false } = parseArgs({
  args: process.argv.slice(2),
  options: argsOptions,
}).values;

const crate = "arm-bindings";

// wasm-pack packages
const run = () => {
  execSync(
    [
      `cd ${crate} &&`,
      "RUSTFLAGS='--cfg getrandom_backend=\"wasm_js\"'",
      "wasm-pack",
      `build ${release ? "--release" : "--debug"}`,
      "--target web",
    ].join(" ")
  );

  const pkg = `./${crate}/pkg/${crate.replace("-", "_")}`;
  const destinationPath = "./src/wasm/";

  execSync(`cp ${pkg}_bg.wasm ${destinationPath}`);
  execSync(`cp ${pkg}.js ${destinationPath}`);
  execSync(`cp ${pkg}.d.ts ${destinationPath}`);
};

run();
