import {
  AuthorizationVerifyingKey,
  Digest,
  hashBytes,
  CallType,
} from "@anoma/lib";
import { fromHex } from "lib/utils";

export function calculateLabelRef(
  forwarderAddress: string,
  tokenAddress: string
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const erc20Bytes = fromHex(tokenAddress);
  return hashBytes(new Uint8Array([...forwarderBytes, ...erc20Bytes]));
}

export function calculateValueRefFromAuth(
  pk: AuthorizationVerifyingKey
): Digest {
  return hashBytes(pk.toBytes());
}

export function calculateValueRefCalltypeUser(
  callType: CallType,
  userAddress: string
): Digest {
  const userAddressBytes = fromHex(userAddress);
  return hashBytes(new Uint8Array([...callType.toVec(), ...userAddressBytes]));
}
