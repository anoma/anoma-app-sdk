import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import { fromHex, generateRandomBytes, toHex } from "lib/utils";
import { PRFDomainMap, type PRFDomain } from "types";
import { isHex, stringToBytes } from "viem";

type KeyPairConstructor<T extends KeyPairBase> = {
  new (
    privateKey: Uint8Array<ArrayBuffer>,
    publicKey: Uint8Array<ArrayBuffer>
  ): T;
  keysName: { privateKey: string; publicKey: string };
};

/**
 * Utilities for serializing {@link KeyPairBase} implementations to and from JSON.
 *
 * Useful for persisting key pairs to session storage or other string-based stores.
 *
 * @example
 * ```typescript
 * const kp = KeyPair.create();
 * const json = KeyPairSerializer.toJson(kp);
 * sessionStorage.setItem("authorityKeyPair", json);
 *
 * const restored = KeyPairSerializer.fromJson(KeyPair, json);
 * ```
 */
export class KeyPairSerializer {
  /**
   * Serializes a {@link KeyPairBase} subclass into a JSON string suitable for
   * persistent storage (e.g. `sessionStorage` or `localStorage`).
   *
   * The JSON object uses the field names defined by `keysName` on the subclass,
   * and values are hex-encoded byte arrays.
   *
   * @param keyPair - The key pair instance to serialize.
   * @returns A JSON string containing hex-encoded private and public key fields.
   *
   * @example
   * ```typescript
   * const kp = KeyPair.create();
   * const json = KeyPairSerializer.toJson(kp);
   * // '{"privateKey":"0xabc...","publicKey":"0xdef..."}'
   * ```
   */
  static toJson<T extends KeyPairBase>(keyPair: T): string {
    const ctor = keyPair.constructor as KeyPairConstructor<T>;
    const { privateKey, publicKey } = ctor.keysName;

    return JSON.stringify({
      [privateKey]: toHex(keyPair.keys.privateKey),
      [publicKey]: toHex(keyPair.keys.publicKey),
    });
  }

  /**
   * Deserializes a JSON string produced by {@link toJson} back into a key pair instance.
   *
   * The JSON must contain hex-encoded fields whose names match the `keysName`
   * property of the target constructor (e.g. `"nk"` / `"cnk"` for
   * {@link NullifierKeyPair}).
   *
   * @param constructor - The key pair subclass to instantiate.
   * @param json - JSON string with hex-encoded key fields.
   * @returns A fully restored key pair of the given subclass type.
   * @throws {Error} If the JSON is malformed or contains non-hex key values.
   *
   * @example
   * ```typescript
   * const json = sessionStorage.getItem("nullifierKeyPair")!;
   * const nkp = KeyPairSerializer.fromJson(NullifierKeyPair, json);
   * console.log(nkp.nk); // Uint8Array — nullifier private key
   * ```
   */
  static fromJson<T extends KeyPairBase>(
    constructor: KeyPairConstructor<T>,
    json: string
  ): T {
    try {
      const obj = JSON.parse(json);
      const { privateKey, publicKey } = constructor.keysName;

      const privHex = obj[privateKey];
      const pubHex = obj[publicKey];

      if (!isHex(privHex) || !isHex(pubHex)) {
        throw new Error("Missing key fields in JSON");
      }

      return new constructor(fromHex(privHex), fromHex(pubHex));
    } catch (e) {
      throw new Error(
        `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }
}

type KeyNames = {
  privateKey: string;
  publicKey: string;
};

/**
 * Abstract base class for all key pair types in the Anoma Pay SDK.
 *
 * Subclasses hold a `privateKey` and a `publicKey` (or equivalent semantics)
 * and implement {@link derivePublicKey} and {@link create} as static factories.
 *
 * You should not instantiate this class directly; use {@link KeyPair} or
 * {@link NullifierKeyPair} instead.
 */
abstract class KeyPairBase {
  readonly keys: {
    privateKey: Uint8Array<ArrayBuffer>;
    publicKey: Uint8Array<ArrayBuffer>;
  };

  static readonly keysName: KeyNames = {
    privateKey: "privateKey",
    publicKey: "publicKey",
  };

  protected get keysName(): KeyNames {
    return (this.constructor as typeof KeyPairBase).keysName;
  }

  static derivePublicKey(
    _privateKey: Uint8Array<ArrayBuffer>
  ): Uint8Array<ArrayBuffer> {
    throw Error("Not implemented");
  }

  static create(
    _seed?: Uint8Array<ArrayBuffer>,
    _domain?: keyof PRFDomain
  ): KeyPairBase {
    throw new Error("Not implemented");
  }

  /**
   * Derives a 32-byte private key using HMAC-SHA256 as a PRF.
   *
   * When `seed` is provided a non-empty `domain` string is required so that
   * keys derived from the same seed for different roles remain independent.
   * When `seed` is absent, cryptographically-random bytes are used and
   * `domain` is ignored.
   *
   * @param seed - Optional 32-byte seed for deterministic derivation.
   * @param domain - PRF domain label from {@link PRFDomainMap}; required when `seed` is provided.
   * @returns A 32-byte private key as a `Uint8Array`.
   */
  static generatePrivateKey(
    seed?: Uint8Array<ArrayBuffer>,
    domain?: keyof typeof PRFDomainMap
  ) {
    const actualSeed = seed ?? generateRandomBytes();
    // We only need to define a domain if a seed was provided
    const domainString = seed && domain ? PRFDomainMap[domain] : "";
    const domainBytes = stringToBytes(domainString);
    return hmac(sha256, actualSeed, domainBytes) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Constructs a key pair from raw byte arrays.
   *
   * Prefer the static {@link create} factory over calling this constructor directly.
   *
   * @param privateKey - The private key bytes.
   * @param publicKey - The corresponding public key bytes.
   */
  constructor(
    privateKey: Uint8Array<ArrayBuffer>,
    publicKey: Uint8Array<ArrayBuffer>
  ) {
    this.keys = { privateKey: privateKey, publicKey: publicKey };
  }
}

/**
 * Standard secp256k1 key pair used for the authority, encryption, and discovery
 * roles in the Anoma Pay key hierarchy.
 *
 * The public key is the 33-byte compressed-point representation.
 *
 * @example
 * ```typescript
 * // Random key pair
 * const kp = KeyPair.create();
 *
 * // Deterministic key pair scoped to the Authority role
 * const seed = new Uint8Array(32); // your 32-byte seed
 * const authorityKp = KeyPair.create(seed, "Authority");
 * ```
 */
export class KeyPair extends KeyPairBase {
  /** The raw 32-byte secp256k1 private key scalar. */
  get privateKey() {
    return this.keys.privateKey;
  }

  /** The 33-byte compressed secp256k1 public key. */
  get publicKey() {
    return this.keys.publicKey;
  }

  /**
   * Signs `message` with the private key using deterministic-k ECDSA (RFC 6979).
   *
   * @param message - UTF-8 string to sign.
   * @returns The DER-encoded ECDSA signature bytes.
   */
  async sign(message: string): Promise<Uint8Array<ArrayBufferLike>> {
    return secp256k1.signAsync(stringToBytes(message), this.privateKey);
  }

  /**
   * Derives the 33-byte compressed secp256k1 public key from a private key.
   *
   * @param privateKey - A 32-byte secp256k1 private key scalar.
   * @returns The corresponding 33-byte compressed public key.
   */
  static override derivePublicKey(privateKey: Uint8Array<ArrayBuffer>) {
    return secp256k1.getPublicKey(privateKey, true) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Creates a secp256k1 key pair, optionally deterministic.
   *
   * When `seed` is omitted, a cryptographically-random private key is generated.
   * When `seed` is provided together with a `domain`, the private key is derived
   * via HMAC-SHA256(seed, domainString) so that the same seed produces independent
   * keys for each role.
   *
   * @param seed - Optional 32-byte seed for deterministic derivation.
   * @param domain - PRF domain from {@link PRFDomain} (`"Authority"`, `"Encryption"`, `"Discovery"`).
   * @returns A new {@link KeyPair} with the derived private/public key pair.
   *
   * @example
   * ```typescript
   * const randomKp = KeyPair.create();
   * const deterministicKp = KeyPair.create(seed, "Encryption");
   * ```
   */
  static create(seed?: Uint8Array<ArrayBuffer>, domain?: keyof PRFDomain) {
    const privateKey = this.generatePrivateKey(seed, domain);
    const publicKey = this.derivePublicKey(privateKey);
    return new KeyPair(privateKey, publicKey);
  }
}

/**
 * Key pair encoding the right to nullify (consume) a resource.
 *
 * - `nk` (nullifier key) — the **private** scalar; keep this secret.
 * - `cnk` (committed nullifier key) — the SHA-256 hash of `nk`; safe to share
 *   and embedded in resources so the protocol can verify ownership without
 *   revealing `nk` until the resource is consumed.
 *
 * @example
 * ```typescript
 * // Random nullifier key pair
 * const nkp = NullifierKeyPair.create();
 * console.log(nkp.nk);  // Uint8Array(32) — keep secret
 * console.log(nkp.cnk); // Uint8Array(32) — public commitment
 *
 * // Deterministic from a seed
 * const nkpDet = NullifierKeyPair.create(seed);
 * ```
 */
export class NullifierKeyPair extends KeyPairBase {
  /** The 32-byte nullifier private key. Keep this secret; it is used to spend resources. */
  get nk() {
    return this.keys.privateKey;
  }

  /** The 32-byte nullifier key commitment (SHA-256 of `nk`). Embedded in resources as proof of ownership. */
  get cnk() {
    return this.keys.publicKey;
  }

  static readonly keysName = {
    privateKey: "nk",
    publicKey: "cnk",
  };

  /**
   * Derives the nullifier key commitment (`cnk`) from the nullifier private key (`nk`).
   *
   * The commitment is simply SHA-256(`nk`) and is safe to embed in on-chain resources.
   *
   * @param nk - The 32-byte nullifier private key.
   * @returns The 32-byte nullifier key commitment.
   */
  static override derivePublicKey(nk: Uint8Array<ArrayBuffer>) {
    return sha256(nk) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Creates a nullifier key pair, optionally from a deterministic seed.
   *
   * When `seed` is omitted, a cryptographically-random key is generated.
   * The private key is derived via HMAC-SHA256(seed, `"ANOMA_NULLIFIER_KEY"`)
   * and the commitment is SHA-256 of that key.
   *
   * @param seed - Optional 32-byte seed for deterministic derivation.
   * @returns A new {@link NullifierKeyPair} with `nk` and `cnk` populated.
   *
   * @example
   * ```typescript
   * const nkp = NullifierKeyPair.create();
   * // or deterministic:
   * const nkpDet = NullifierKeyPair.create(seed);
   * ```
   */
  static override create(seed?: Uint8Array<ArrayBuffer>) {
    const privateKey = this.generatePrivateKey(seed, "Nullifier");
    const publicKey = this.derivePublicKey(privateKey);
    return new NullifierKeyPair(privateKey, publicKey);
  }
}
