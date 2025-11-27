import { initWasm } from "wasm";
import { validHexBytes, validHexString } from "lib/utils";
import invariant from "tiny-invariant";

const DIGEST_BYTES_LENGTH = 32;
const DIGEST_HEX_LENGTH = DIGEST_BYTES_LENGTH * 2;

/**
 * Generic Anoma App Client
 *
 * Requires instance of Digest (of identifying hash), which in turn requires the wasm module
 * from @anoma/lib to first be initialized.
 */
export abstract class Client {
  digest: string;

  constructor(digest?: string) {
    if (digest) {
      invariant(
        validHexBytes(digest, DIGEST_BYTES_LENGTH),
        `Invalid hex length for ${this.constructor.name}, expected ${DIGEST_HEX_LENGTH}, received ${digest.length}`
      );
      invariant(
        validHexString(digest),
        `Invalid hexadecimal string for ${this.constructor.name}, received ${digest}`
      );
      this.digest = digest;
    } else {
      throw new Error(
        `Instantiate this class using \`await ${this.constructor.name}.init()\``
      );
    }
  }
}

/**
 * Client initializer properly instantiates wasm module from `@anoma/lib` so
 * that it may then utilize WebAssembly memory. This Digest
 * represents the hash identifier of the Guest program compiled for this type of
 * resource logic (the bytes of this digest produce the `logic_ref`).
 */
export async function initClient<T extends Client>(
  client: new (digest?: string) => T,
  id: string
): Promise<T> {
  return initWasm().then(() => new client(id));
}
