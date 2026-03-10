import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import {
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys/models";
import { KEYRING_SALT } from "lib-constants";
import { invariant } from "lib/utils";
import type { UserKeyring, UserPublicKeys } from "types";

/**
 * Derives the full four-key user keyring used by the Anoma Pay SDK.
 *
 * The keyring contains:
 * - **authorityKeyPair** – secp256k1 key used to sign actions and prove resource ownership.
 * - **nullifierKeyPair** – key whose commitment (`cnk`) is embedded in resources; the private
 *   key (`nk`) is required to spend (nullify) them.
 * - **encryptionKeyPair** – secp256k1 key used to encrypt resource payloads for the owner.
 * - **discoveryKeyPair** – secp256k1 key registered with the indexer so it can tag resources
 *   addressed to this user.
 *
 * Each key is derived via HMAC-SHA256(seed, domainString) so that the same seed produces
 * independent keys for every role. When `seed` is omitted, all four keys are generated from
 * independent random bytes.
 *
 * @param seed - Optional 32-byte seed for fully deterministic derivation of all four keys.
 * @returns A {@link UserKeyring} containing the four role-specific key pairs.
 *
 * @example
 * ```typescript
 * // Random keyring (suitable for new users)
 * const keyring = createUserKeyring();
 *
 * // Deterministic keyring (reproducible from a saved seed)
 * const seed = crypto.getRandomValues(new Uint8Array(32));
 * const keyring = createUserKeyring(seed);
 * ```
 */
export const createUserKeyring = (
  seed?: Uint8Array<ArrayBuffer>
): UserKeyring => {
  return {
    /**
     * Used to authorise actions and express ownership over resources for
     * applications that have a notion of ownership and require explicit authorisation of the owner
     * @param seed Optional seed to deterministically derive the key pair
     */
    authorityKeyPair: KeyPair.create(seed, "Authority"),

    /**
     * These keys are used to reflect the right to nullify
     * @param seed Optional seed to deterministically derive the key pair
     */
    nullifierKeyPair: NullifierKeyPair.create(seed),

    /**
     * This static key pair is used to produce resource encryption keys
     * @param seed Optional seed to deterministically derive the key pair
     */
    encryptionKeyPair: KeyPair.create(seed, "Encryption"),

    /**
     * This static key pair is used to produce discovery encryption keys
     * @param seed Optional seed to deterministically derive the key pair
     */
    discoveryKeyPair: KeyPair.create(seed, "Discovery"),
  };
};

/**
 * Extracts only the public-key subset from a full {@link UserKeyring}.
 *
 * The returned {@link UserPublicKeys} object is safe to share (e.g. encode into
 * a Pay Address) because it contains no private key material.
 *
 * @param keyring - The full user keyring containing all four key pairs.
 * @returns A {@link UserPublicKeys} object with the four public components:
 *   `authorityPublicKey`, `discoveryPublicKey`, `encryptionPublicKey`, and
 *   `nullifierKeyCommitment`.
 *
 * @example
 * ```typescript
 * const keyring = createUserKeyring();
 * const publicKeys = extractUserPublicKeys(keyring);
 * const payAddress = encodePayAddress(publicKeys);
 * ```
 */
export const extractUserPublicKeys = (keyring: UserKeyring): UserPublicKeys => {
  return {
    authorityPublicKey: keyring.authorityKeyPair.publicKey,
    discoveryPublicKey: keyring.discoveryKeyPair.publicKey,
    encryptionPublicKey: keyring.encryptionKeyPair.publicKey,
    nullifierKeyCommitment: keyring.nullifierKeyPair.cnk,
  };
};

/**
 * Derives a {@link UserKeyring} from an Input Keying Material (IKM) byte array.
 *
 * The IKM is first stretched to a 32-byte seed via HKDF-SHA256 using the
 * SDK's internal salt, then passed to {@link createUserKeyring}. Use this when
 * you have a high-entropy secret (e.g. the PRF output from a WebAuthn passkey)
 * but it is not already 32 bytes of uniformly-random data.
 *
 * @param ikm - High-entropy input keying material (any length).
 * @returns A deterministic {@link UserKeyring} derived from `ikm`.
 *
 * @example
 * ```typescript
 * // Typical use: PRF output from a passkey (see createUserKeyringFromPasskey)
 * const ikm = new Uint8Array(prfOutput);
 * const keyring = createUserKeyringFromIkm(ikm);
 * ```
 */
export const createUserKeyringFromIkm = (ikm: Uint8Array<ArrayBuffer>) => {
  const seed = hkdf(sha256, ikm, KEYRING_SALT, "", 32);
  return createUserKeyring(seed as Uint8Array<ArrayBuffer>);
};

/**
 * Serializes a {@link UserKeyring} to a JSON string for persistent storage.
 *
 * Each of the four key pairs is serialized individually via
 * {@link KeyPairSerializer.toJson}. The resulting string can be saved to
 * `sessionStorage`, `localStorage`, or any other string-based store, then
 * restored with {@link deserializeUserKeyring}.
 *
 * @param keyring - The keyring to serialize.
 * @returns A JSON string with all four hex-encoded key pairs.
 *
 * @example
 * ```typescript
 * const keyring = createUserKeyring();
 * sessionStorage.setItem("keyring", serializeUserKeyring(keyring));
 * ```
 */
export const serializeUserKeyring = (keyring: UserKeyring): string => {
  return JSON.stringify({
    authorityKeyPair: KeyPairSerializer.toJson(keyring.authorityKeyPair),
    discoveryKeyPair: KeyPairSerializer.toJson(keyring.discoveryKeyPair),
    encryptionKeyPair: KeyPairSerializer.toJson(keyring.encryptionKeyPair),
    nullifierKeyPair: KeyPairSerializer.toJson(keyring.nullifierKeyPair),
  });
};

/**
 * Deserializes a {@link UserKeyring} from a JSON string produced by
 * {@link serializeUserKeyring}.
 *
 * @param json - JSON string previously produced by {@link serializeUserKeyring}.
 * @returns The restored {@link UserKeyring} with all four key pairs.
 * @throws {Error} If the JSON is malformed or any key field is missing or invalid.
 *
 * @example
 * ```typescript
 * const json = sessionStorage.getItem("keyring")!;
 * const keyring = deserializeUserKeyring(json);
 * ```
 */
export const deserializeUserKeyring = (json: string): UserKeyring => {
  const obj = JSON.parse(json);
  return {
    authorityKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.authorityKeyPair),
    discoveryKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.discoveryKeyPair),
    encryptionKeyPair: KeyPairSerializer.fromJson(
      KeyPair,
      obj.encryptionKeyPair
    ),
    nullifierKeyPair: KeyPairSerializer.fromJson(
      NullifierKeyPair,
      obj.nullifierKeyPair
    ),
  };
};

/**
 * Derives a {@link UserKeyring} from a WebAuthn `PublicKeyCredential` whose
 * `prf` client extension was requested during authentication.
 *
 * The function reads the first PRF output from `credential.getClientExtensionResults().prf.results.first`
 * and passes it to {@link createUserKeyringFromIkm}. The resulting keyring is
 * fully deterministic for the same passkey and PRF input, so users can
 * re-derive their keyring without storing any key material.
 *
 * @param credential - A `PublicKeyCredential` obtained from `navigator.credentials.get()`
 *   with the `prf` extension enabled and at least one PRF evaluation result.
 * @returns A deterministic {@link UserKeyring} bound to the passkey PRF output.
 * @throws If the passkey provider does not support the WebAuthn PRF extension.
 *
 * @example
 * ```typescript
 * const credential = await navigator.credentials.get({
 *   publicKey: {
 *     // ...
 *     extensions: { prf: { eval: { first: new Uint8Array(32) } } },
 *   },
 * }) as PublicKeyCredential;
 *
 * const keyring = createUserKeyringFromPasskey(credential);
 * ```
 */
export const createUserKeyringFromPasskey = (
  credential: PublicKeyCredential
) => {
  const prfResults = credential.getClientExtensionResults().prf?.results;
  const prfOutput = prfResults?.first;
  invariant(
    prfOutput,
    `The selected Passkey provider doesn't support WebAuthn PRF extension, required for authentication.
        If you're selecting the Passkey to be stored in the browser, please try a different way.`
  );

  const ikm =
    ArrayBuffer.isView(prfOutput) ?
      new Uint8Array(prfOutput.buffer)
    : new Uint8Array(prfOutput);

  return createUserKeyringFromIkm(ikm);
};
