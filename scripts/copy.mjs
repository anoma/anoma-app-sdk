import { execSync } from "child_process";
import { resolve } from "node:path";

const WASM_ROOT = "./src/wasm";
const DESTINATION_PATH = "./dist/";
const pkgs = ["anomapay_lib", "anomapay_lib_v2", "arm_risc0_bindings"];

for (const pkg of pkgs) {
  const sourcePath = resolve(`${WASM_ROOT}/${pkg}/${pkg}_bg.wasm`);
  const destinationPath = resolve(`${DESTINATION_PATH}/`);
  console.info(
    `[ \x1b[32mINFO\x1b[37m ] Copying \x1b[33m${sourcePath}\x1b[37m to \x1b[35m${destinationPath}\x1b[37m`
  );
  execSync(`cp ${sourcePath} ${destinationPath}`);
}
