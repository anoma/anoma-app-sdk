import { fromBase64, toBase64 } from "./utils";

export const toBase64Url = (bytes: Uint8Array): string => {
  return toBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const fromBase64Url = (base64url: string): Uint8Array<ArrayBuffer> => {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");
  return fromBase64(base64);
};

export const isValidBase64Url = (str: string): boolean => {
  if (!/^[A-Za-z0-9\-_]+$/.test(str)) {
    return false;
  }
  if (str.length % 4 === 1) {
    return false;
  }
  try {
    fromBase64Url(str);
    return true;
  } catch {
    return false;
  }
};
