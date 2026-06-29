import { aesDecrypt, aesEncrypt } from "lib/crypto";
import { bigIntReplacer } from "lib/utils";

type JsonReviver = (key: string, value: unknown) => unknown;

/** Encrypts a bigint-safe JSON serialization of `value` with the storage key. */
export const encryptJson = (
  storageKey: Uint8Array<ArrayBuffer>,
  value: unknown
): Promise<string> =>
  aesEncrypt(storageKey, JSON.stringify(value, bigIntReplacer));

/** Decrypts a blob produced by {@link encryptJson}, reviving bigints via `reviver`. */
export const decryptJson = async <T>(
  storageKey: Uint8Array<ArrayBuffer>,
  encrypted: string,
  reviver: JsonReviver
): Promise<T> =>
  JSON.parse(await aesDecrypt(storageKey, encrypted), reviver) as T;
