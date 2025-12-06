import { execSync, spawnSync } from "child_process";
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

const crates = ["arm-bindings"];

const wasmPackBuilder = crate => {
  // wasm-pack packages
  const { status } = spawnSync(
    "wasm-pack",
    ["build", release ? "--release" : "--debug", ["--target", "web"]].flat(),
    {
      stdio: "inherit",
      cwd: `./${crate}`,
      env: {
        ...process.env,
        RUSTFLAGS: '--cfg getrandom_backend="wasm_js"',
      },
    }
  );
  if (status !== 0) {
    process.exit(status);
  }

  const pkg = `./${crate}/pkg/${crate.replace("-", "_")}`;
  const destinationPath = "./src/wasm/";

  execSync(`cp ${pkg}_bg.wasm ${destinationPath}`);
  execSync(`cp ${pkg}.js ${destinationPath}`);
  execSync(`cp ${pkg}.d.ts ${destinationPath}`);
};

crates.forEach(crate => {
  wasmPackBuilder(crate);
});
