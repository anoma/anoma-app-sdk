import { execSync, spawnSync } from "child_process";
import { resolve } from "node:path";
import { parseArgs } from "util";
import { pkgDestinations } from "./paths.mjs";

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

const CARGO_WORKSPACE = "anoma-apps-lib";
const crates = ["arm_risc0_bindings", "anomapay_lib", "anomapay_lib_v2"];

const wasmPackBuilder = crate => {
  // wasm-pack packages
  const { status } = spawnSync(
    "wasm-pack",
    ["build", release ? "--release" : "--debug", ["--target", "web"]].flat(),
    {
      stdio: "inherit",
      cwd: resolve(`./${CARGO_WORKSPACE}/${crate}`),
      env: {
        ...process.env,
        RUSTFLAGS: '--cfg getrandom_backend="wasm_js"',
      },
    }
  );
  if (status !== 0) {
    process.exit(status);
  }

  const pkg = resolve(`./${CARGO_WORKSPACE}/${crate}/pkg/${crate}`);
  const destinationPath = resolve(`./src/wasm/${pkgDestinations[crate]}`);

  console.info(
    `[ \x1b[32mINFO\x1b[37m ] Copying \x1b[33m${pkg}* assets \x1b[37m to \x1b[35m${destinationPath}\x1b[37m`
  );

  execSync(`cp ${pkg}_bg.wasm ${destinationPath}/`);
  execSync(`cp ${pkg}.js ${destinationPath}/`);
  execSync(`cp ${pkg}.d.ts ${destinationPath}/`);
};

crates.forEach(crate => {
  wasmPackBuilder(crate);
});
