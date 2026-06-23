import type { IndexerEVMTransaction, NullifierRecord } from "api";
import { buildNullifierRecord } from "api";
import { AUTH_SIGNATURE_DOMAIN } from "lib-constants";
import { fromBase64, fromHex, normalizeHex } from "lib/utils";
import type { Address, Hex } from "viem";
import {
  AuthoritySignature,
  AuthoritySigningKey,
  AuthorityVerifyingKey,
  Digest,
  hashBytes,
  MerkleTree,
  NullifierKey,
  PublicKey,
  Resource,
} from "wasm";
import type { ConsumedResource, CreatedResource } from "./types/resources";

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

/**
 * The user's own persistent created notes (a deposit mint or spend change) —
 * those encrypted back to their encryption key. Excludes receiver outputs and
 * ephemeral burn/padding notes.
 */
export function getOwnedCreatedResources(
  createdResources: CreatedResource[],
  encryptionPublicKey: Uint8Array
): CreatedResource[] {
  const ownerEncryptionKey = new PublicKey(encryptionPublicKey).toBase64();
  return createdResources.filter(
    ({ resource, witnessData }) =>
      !resource.is_ephemeral &&
      witnessData.TokenTransferPersistent?.receiverEncryptionPublicKey ===
        ownerEncryptionKey
  );
}

/**
 * Nullifier records for a transaction's just-consumed resources, tagged with
 * the consuming transaction — to optimistically mask spent notes.
 */
export function buildConsumedNullifierRecords(
  consumedResources: ConsumedResource[],
  evmTransaction: IndexerEVMTransaction
): NullifierRecord[] {
  return consumedResources.map(({ resource, nullifierKey }) => {
    const decoded = Resource.decode(resource);
    const key = new NullifierKey(fromBase64(nullifierKey));
    return buildNullifierRecord(decoded.nullifier(key).toHex(), evmTransaction);
  });
}
