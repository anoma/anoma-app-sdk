import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { pkgDestinations } from "./paths.mjs";

const WASM_ROOT = "./src/wasm";
const DESTINATION_PATH = "./dist/";

for (const [pkg, folder] of Object.entries(pkgDestinations)) {
  const sourcePath = resolve(`${WASM_ROOT}/${folder}/${pkg}_bg.wasm`);
  const destinationPath = resolve(`${DESTINATION_PATH}/`);
  console.info(
    `[ \x1b[32mINFO\x1b[37m ] Copying \x1b[33m${sourcePath}\x1b[37m to \x1b[35m${destinationPath}\x1b[37m`
  );
  execSync(`cp ${sourcePath} ${destinationPath}`);
}
