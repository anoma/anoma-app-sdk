import bs58 from "bs58";
import CRC32 from "crc-32";
import type { UserPublicKeys } from "types";

// TODO: this shouldn't be here
export type PayAddress = string;

const getCrc32 = (keyBytes: Uint8Array): Uint8Array => {
  const crc = CRC32.buf(keyBytes) >>> 0;
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, crc); // big-endian
  return bytes;
};

const areEqualsBytes = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const encodePayAddress = (key: UserPublicKeys): PayAddress => {
  const keyBytes = new Uint8Array([
    ...key.authorityPublicKey,
    ...key.discoveryPublicKey,
    ...key.encryptionPublicKey,
    ...key.nullifierKeyCommitment,
  ]);
  const crcBytes = getCrc32(keyBytes);
  const payAddressBytes = new Uint8Array([...keyBytes, ...crcBytes]);
  return bs58.encode(payAddressBytes);
};

export const decodePayAddress = (payAddress: PayAddress): UserPublicKeys => {
  if (!payAddress || payAddress.trim() === "") {
    throw new Error("Pay address cannot be empty");
  }

  const payAddressBytes = bs58.decode(payAddress);

  // Validate expected length: 33 + 33 + 33 + 32 + 4 = 135 bytes
  const expectedLength = 135;
  if (payAddressBytes.length !== expectedLength) {
    throw new Error(
      `Invalid Pay Address: expected ${expectedLength} bytes, got ${payAddressBytes.length}`
    );
  }

  let i = 0;
  const getSlice = (length: number) => payAddressBytes.slice(i, (i += length));

  const authorityPublicKey = getSlice(33);
  const discoveryPublicKey = getSlice(33);
  const encryptionPublicKey = getSlice(33);
  const nullifierKeyCommitment = getSlice(32);
  const addressCrc = getSlice(4);

  const key: UserPublicKeys = {
    authorityPublicKey,
    discoveryPublicKey,
    encryptionPublicKey,
    nullifierKeyCommitment,
  };
  const keyBytes = new Uint8Array([
    ...key.authorityPublicKey,
    ...key.discoveryPublicKey,
    ...key.encryptionPublicKey,
    ...key.nullifierKeyCommitment,
  ]);
  const keyCrc = getCrc32(keyBytes);

  // Validate CRC
  if (!areEqualsBytes(addressCrc, keyCrc)) {
    throw new Error("Invalid Pay Address: integrity check failed");
  }

  return key;
};

export function isValidPayAddress(payAddress: string): boolean {
  try {
    decodePayAddress(payAddress);
    return true;
  } catch {
    return false;
  }
}
