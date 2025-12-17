import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import * as secp256k1 from "@noble/secp256k1";
import { fromHex, generateRandomBytes, toHex } from "lib/utils";
import { PRFDomainMap, type PRFDomain } from "types";

type KeyPairConstructor<T extends KeyPairBase> = {
  new (
    privateKey: Uint8Array<ArrayBuffer>,
    publicKey: Uint8Array<ArrayBuffer>
  ): T;
  keysName: { privateKey: string; publicKey: string };
};

/**
 * Utilities for serializing {@link KeyPairBase} implementations.
 */
export class KeyPairSerializer {
  /**
   * Serializes a {@link KeyPairBase} subclass into JSON so it can be persisted.
   * @param keyPair Instance to serialize
   * @returns JSON string containing hex-encoded private/public keys
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
   * Deserializes JSON produced by {@link toJson} back into a key pair.
   * @param constructor Key pair subclass to instantiate
   * @param json JSON string with fields matching {@link KeyPairBase.keysName}
   * @returns Key pair with private/public keys restored from hex
   * @example  KeyPairSerializer.fromJson(NullifierKeyPair, keyringObj.nullifierKeyPair)
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

      if (typeof privHex !== "string" || typeof pubHex !== "string") {
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
 * Base class for key pairs that encapsulates shared helpers.
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
   * Generates a private key using PRF with the provided seed and domain.
   * @param seed Optional seed; random bytes are used when absent
   * @param domain PRF domain to separate derivations
   * @returns Derived 32-byte private key
   */
  static generatePrivateKey(
    seed?: Uint8Array<ArrayBuffer>,
    domain?: keyof typeof PRFDomainMap
  ) {
    const actualSeed = seed ?? generateRandomBytes();
    // We only need to define a domain if a seed was provided
    const domainString = seed && domain ? PRFDomainMap[domain] : "";
    const domainBytes = new TextEncoder().encode(domainString);
    return hmac(sha256, actualSeed, domainBytes) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Instantiates the KeyPair object
   * @param privateKey Private key bytes
   * @param publicKey Public key bytes
   */
  constructor(
    privateKey: Uint8Array<ArrayBuffer>,
    publicKey: Uint8Array<ArrayBuffer>
  ) {
    this.keys = { privateKey: privateKey, publicKey: publicKey };
  }
}

/**
 * Standard secp256k1 key pair used for authority, encryption, and discovery.
 */
export class KeyPair extends KeyPairBase {
  get privateKey() {
    return this.keys.privateKey;
  }

  get publicKey() {
    return this.keys.publicKey;
  }

  /**
   * Generates deterministic-k ECDSA signature
   * @param message Message to sign
   */
  async sign(message: string): Promise<Uint8Array<ArrayBufferLike>> {
    return secp256k1.signAsync(
      new TextEncoder().encode(message),
      this.privateKey
    );
  }

  /**
   * Derives the compressed secp256k1 public key for the provided private key.
   * @param privateKey Private key bytes
   */
  static override derivePublicKey(privateKey: Uint8Array<ArrayBuffer>) {
    return secp256k1.getPublicKey(privateKey, true) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Creates a standard secp256k1 key pair optionally scoped by domain.
   * @param seed Optional seed to deterministically derive the key pair
   * @param domain Domain identifier from {@link PRFDomain}
   */
  static create(seed?: Uint8Array<ArrayBuffer>, domain?: keyof PRFDomain) {
    const privateKey = this.generatePrivateKey(seed, domain);
    const publicKey = this.derivePublicKey(privateKey);
    return new KeyPair(privateKey, publicKey);
  }
}

/**
 * Keys used to reflect the right to nullify
 */
export class NullifierKeyPair extends KeyPairBase {
  get nk() {
    return this.keys.privateKey;
  }

  get cnk() {
    return this.keys.publicKey;
  }

  static readonly keysName = {
    privateKey: "nk",
    publicKey: "cnk",
  };

  /**
   * Deterministically derives the nullifier commitment from the private key.
   * @param nk Nullifier private key bytes
   */
  static override derivePublicKey(nk: Uint8Array<ArrayBuffer>) {
    return sha256(nk) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Creates a nullifier key pair
   * @param seed Optional seed to deterministically derive the key pair
   */
  static override create(seed?: Uint8Array<ArrayBuffer>) {
    const privateKey = this.generatePrivateKey(seed, "Nullifier");
    const publicKey = this.derivePublicKey(privateKey);
    return new NullifierKeyPair(privateKey, publicKey);
  }
}
