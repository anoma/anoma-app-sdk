import { AuthorizationVerifyingKey, Digest, hashBytes } from "@anoma/lib";
import { fromHex, normalizeHex } from "lib/utils";

export function calculateLabelRef(
  forwarderAddress: string,
  tokenAddress: string
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const erc20Bytes = fromHex(tokenAddress);
  return hashBytes(new Uint8Array([...forwarderBytes, ...erc20Bytes]));
}

export function calculateValueRefFromAuth(
  authorizationVerifyingKey: AuthorizationVerifyingKey,
  encryptionPublicKey: string
): Digest {
  return hashBytes(
    new Uint8Array([
      ...authorizationVerifyingKey.toBytes(),
      ...fromHex(encryptionPublicKey),
    ])
  );
}

export function calculateValueRefFromUserAddress(userAddress: string): Digest {
  // Padding with zero to fill the 32 bytes required by value_ref
  const paddedAddress = normalizeHex(userAddress).padEnd(64, "0");
  return Digest.fromHex(paddedAddress);
}
