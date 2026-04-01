import { AUTH_SIGNATURE_DOMAIN } from "lib-constants";
import { fromHex, normalizeHex } from "lib/utils";
import type { Parameters } from "types";
import type { Address, Hex } from "viem";
import {
  AuthoritySignature,
  AuthoritySigningKey,
  AuthorityVerifyingKey,
  Digest,
  hashBytes,
  MerkleTree,
} from "wasm";

/** Estimates the total proving time for a transfer based on the number of resources. */
export const estimateTransferTimeInSeconds = (
  parameters?: Parameters,
  opts?: { averageTimePerProofInSeconds: number }
) => {
  const averageProofPerResource = 1;
  const averageTimePerProof = opts?.averageTimePerProofInSeconds ?? 0;
  const resourcesAmount =
    parameters ?
      parameters.consumed_resources.length + parameters.created_resources.length
    : 0;
  return resourcesAmount * averageTimePerProof * averageProofPerResource;
};

/** Computes the label reference digest from a forwarder and token contract address. */
export function calculateLabelRef(
  forwarderAddress: Address,
  tokenAddress: Address
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const erc20Bytes = fromHex(tokenAddress);
  return hashBytes(new Uint8Array([...forwarderBytes, ...erc20Bytes]));
}

/** Computes the value reference digest from an authority verifying key and encryption public key. */
export function calculateValueRefFromAuth(
  authorizationVerifyingKey: AuthorityVerifyingKey,
  encryptionPublicKey: Hex
): Digest {
  return hashBytes(
    new Uint8Array([
      ...authorizationVerifyingKey.toBytes(),
      ...fromHex(encryptionPublicKey),
    ])
  );
}

/** Computes the value reference digest from an EVM user address, zero-padded to 32 bytes. */
export function calculateValueRefFromUserAddress(userAddress: string): Digest {
  // Padding with zero to fill the 32 bytes required by value_ref
  const paddedAddress = normalizeHex(userAddress).padEnd(64, "0");
  return Digest.fromHex(paddedAddress);
}

/**
 * Authorize an array of actions and return the signature
 */
export function authorizeActions(
  actions: Digest[],
  authorizationKeyBytes: Uint8Array
): AuthoritySignature {
  const authorizationKey = AuthoritySigningKey.fromBytes(authorizationKeyBytes);
  const actionTree = new MerkleTree(actions);
  return authorizationKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);
}
