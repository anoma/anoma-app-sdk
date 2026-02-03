/* tslint:disable */
/* eslint-disable */
export interface EncodedKeypair {
  secret_key: string;
  public_key: string;
}

export interface ResourceProps {
  isEphemeral: boolean;
  quantity: bigint;
  logicRef: string;
  labelRef: string;
  valueRef: string;
  nonce: string;
  randSeed: string;
  nkCommitment: string;
}

export interface EncodedResource {
  is_ephemeral: boolean;
  quantity: bigint;
  logic_ref: string;
  label_ref: string;
  value_ref: string;
  nonce: string;
  rand_seed: string;
  nk_commitment: string;
}

export interface EncodedNullifierKeyPair {
  nk: string;
  cnk: string;
}

export class AuthoritySignature {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  toBytes(): Uint8Array;
  static fromBytes(bytes: Uint8Array): AuthoritySignature;
}

export class AuthoritySigningKey {
  free(): void;
  [Symbol.dispose](): void;
  constructor();
  sign(domain: string, message: Uint8Array): AuthoritySignature;
  authorize(domain: string, action_tree: MerkleTree): AuthoritySignature;
  toBytes(): Uint8Array;
  static fromBytes(bytes: Uint8Array): AuthoritySigningKey;
}

export class AuthorityVerifyingKey {
  free(): void;
  [Symbol.dispose](): void;
  constructor(pk_bytes: Uint8Array);
  static fromSigningKey(
    signing_key: AuthoritySigningKey
  ): AuthorityVerifyingKey;
  verify(
    domain: string,
    message: Uint8Array,
    signature: AuthoritySignature
  ): void;
  static fromHex(pk_hex: string): AuthorityVerifyingKey;
  toBytes(): Uint8Array;
}

export class CallType {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  toVec(): Uint8Array;
  static readonly Wrap: CallType;
  static readonly Unwrap: CallType;
}

export class Ciphertext {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static fromBytes(bytes: Uint8Array): Ciphertext;
  static fromWords(words: Uint32Array): Ciphertext;
  inner(): Uint8Array;
  asWords(): Uint32Array;
  static encrypt(
    message: Uint8Array,
    receiver_pk: PublicKey,
    sender_sk: SecretKey
  ): Ciphertext;
  decrypt(sk: SecretKey): Uint8Array;
  toJson(): any;
}

export class Digest {
  free(): void;
  [Symbol.dispose](): void;
  constructor(bytes: Uint8Array);
  static fromBytes(bytes: Uint8Array): Digest;
  toBytes(): Uint8Array;
  toHex(): string;
  static fromHex(hex: string): Digest;
  static default(): Digest;
}

export class HeliaxKeys {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static readonly HELIAX_FEE_LOGIC_REF: string;
  static readonly HELIAX_FEE_LABEL_REF_WETH: string;
  static readonly HELIAX_FEE_LABEL_REF_USDC: string;
  static readonly HELIAX_FEE_LABEL_REF_XAN: string;
  static readonly HELIAX_FEE_VALUE_REF: string;
  static readonly HELIAX_FEE_NULLIFIER_KEY_COMMITMENT: string;
  static readonly HELIAX_FEE_DISCOVERY_PK: string;
  static readonly HELIAX_FEE_ENCRYPTION_PK: string;
}

export class InitialRoot {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static bytes(): Uint8Array;
}

export class Keypair {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static new(sk_bytes: Uint8Array, pk_bytes: Uint8Array): Keypair;
  encode(): EncodedKeypair;
  static decode(encoded: EncodedKeypair): Keypair;
  static random(): Keypair;
  serialize(): Uint8Array;
  static deserialize(bytes: Uint8Array): SecretKey;
  sk: SecretKey;
  pk: PublicKey;
}

export class MerkleTree {
  free(): void;
  [Symbol.dispose](): void;
  constructor(leaves: Digest[]);
  root(): Digest;
  /**
   * Returns hex string representing the actionTreeRoot bytes needed for
   * Permit2 signing. This is only available in a browser wasm target.
   */
  toWitness(): string;
}

export class NullifierKey {
  free(): void;
  [Symbol.dispose](): void;
  constructor(nk_bytes: Uint8Array);
  commit(): NullifierKeyCommitment;
  inner(): Uint8Array;
  static random(): NullifierKeyPair;
  toBase64(): string;
  static fromBase64(encoded: string): NullifierKey;
  static default(): NullifierKey;
}

export class NullifierKeyCommitment {
  free(): void;
  [Symbol.dispose](): void;
  constructor(nk_cmt_bytes: Uint8Array);
  inner(): Digest;
  toBase64(): string;
  static fromBase64(encoded: string): NullifierKeyCommitment;
}

export class NullifierKeyPair {
  free(): void;
  [Symbol.dispose](): void;
  constructor(nk: NullifierKey, cnk: NullifierKeyCommitment);
  toJson(): any;
  static fromJson(json: any): NullifierKeyPair;
  encode(): EncodedNullifierKeyPair;
  static decode(encoded: EncodedNullifierKeyPair): NullifierKeyPair;
  nk: NullifierKey;
  cnk: NullifierKeyCommitment;
}

export class PublicKey {
  free(): void;
  [Symbol.dispose](): void;
  constructor(bytes: Uint8Array);
  static fromBase64(pk_b64: string): PublicKey;
  toBase64(): string;
  static fromHex(pk_hex: string): PublicKey;
  toHex(): string;
  toBytes(): Uint8Array;
  toAffinePointBytes(): Uint8Array;
  static fromAffinePointBytes(bytes: Uint8Array): PublicKey;
  encode(): Uint8Array;
}

export class Resource {
  free(): void;
  [Symbol.dispose](): void;
  constructor(props: ResourceProps);
  static create(
    logic_ref: Digest,
    label_ref: Digest,
    quantity: bigint,
    value_ref: Digest,
    is_ephemeral: boolean,
    nonce: Digest,
    nk_cmt: NullifierKeyCommitment
  ): Resource;
  encode(): EncodedResource;
  static decode(encoded: EncodedResource): Resource;
  commitment(): Digest;
  nullifier(nf_key: NullifierKey): Digest;
  static fromBytes(bytes: Uint8Array): Resource;
}

export class ResourceWithLabel {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static fromEncrypted(
    payload: Uint8Array,
    sk_bytes: Uint8Array
  ): ResourceWithLabel;
  /**
   * Get resource instance
   */
  readonly resource: Resource;
  /**
   * Get forwarder as hex
   */
  readonly forwarder: string;
  /**
   * Get erc20_token_addr as hex
   */
  readonly erc20TokenAddress: string;
}

export class SecretKey {
  free(): void;
  [Symbol.dispose](): void;
  constructor(bytes: Uint8Array);
  static random(): SecretKey;
  toPublicKey(): PublicKey;
  static fromBytes(bytes: Uint8Array): SecretKey;
  toBytes(): Uint8Array;
  static fromBase64(sk_b64: string): SecretKey;
  toBase64(): string;
  static fromHex(sk_hex: string): SecretKey;
  toHex(): string;
}

export function bytesToWords(bytes: Uint8Array): Uint32Array;

export function convertCounterToValueRef(value: bigint): Uint8Array;

/**
 * Bind reusable utils from arm-risc0
 */
export function hashBytes(bytes: Uint8Array): Digest;

export function hashTwo(left: Digest, right: Digest): Digest;

/**
 * Return a 32-byte randome vec
 */
export function randomBytes(): Uint8Array;

export function wordsToBytes(words: Uint32Array): Uint8Array;

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_secretkey_free: (a: number, b: number) => void;
  readonly secretkey_new: (a: number, b: number) => [number, number, number];
  readonly secretkey_random: () => number;
  readonly secretkey_toPublicKey: (a: number) => number;
  readonly secretkey_fromBytes: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly secretkey_toBytes: (a: number) => [number, number];
  readonly secretkey_fromBase64: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly secretkey_toBase64: (a: number) => [number, number];
  readonly secretkey_fromHex: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly secretkey_toHex: (a: number) => [number, number];
  readonly __wbg_publickey_free: (a: number, b: number) => void;
  readonly publickey_new: (a: number, b: number) => [number, number, number];
  readonly publickey_fromBase64: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly publickey_toBase64: (a: number) => [number, number, number, number];
  readonly publickey_fromHex: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly publickey_toHex: (a: number) => [number, number];
  readonly publickey_toBytes: (a: number) => [number, number];
  readonly publickey_toAffinePointBytes: (
    a: number
  ) => [number, number, number, number];
  readonly publickey_fromAffinePointBytes: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly publickey_encode: (a: number) => [number, number, number, number];
  readonly __wbg_keypair_free: (a: number, b: number) => void;
  readonly __wbg_get_keypair_sk: (a: number) => number;
  readonly __wbg_set_keypair_sk: (a: number, b: number) => void;
  readonly __wbg_get_keypair_pk: (a: number) => number;
  readonly __wbg_set_keypair_pk: (a: number, b: number) => void;
  readonly keypair_new: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => [number, number, number];
  readonly keypair_encode: (a: number) => [number, number, number];
  readonly keypair_decode: (a: any) => [number, number, number];
  readonly keypair_random: () => number;
  readonly keypair_serialize: (a: number) => [number, number, number, number];
  readonly keypair_deserialize: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly __wbg_ciphertext_free: (a: number, b: number) => void;
  readonly ciphertext_fromBytes: (a: number, b: number) => number;
  readonly ciphertext_fromWords: (a: number, b: number) => number;
  readonly ciphertext_inner: (a: number) => [number, number];
  readonly ciphertext_asWords: (a: number) => [number, number];
  readonly ciphertext_encrypt: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => [number, number, number];
  readonly ciphertext_decrypt: (
    a: number,
    b: number
  ) => [number, number, number, number];
  readonly ciphertext_toJson: (a: number) => [number, number, number];
  readonly convertCounterToValueRef: (a: bigint, b: bigint) => [number, number];
  readonly randomBytes: () => [number, number];
  readonly __wbg_initialroot_free: (a: number, b: number) => void;
  readonly initialroot_bytes: () => [number, number];
  readonly __wbg_digest_free: (a: number, b: number) => void;
  readonly digest_new: (a: number, b: number) => [number, number, number];
  readonly digest_fromBytes: (a: number, b: number) => [number, number, number];
  readonly digest_toBytes: (a: number) => [number, number];
  readonly digest_toHex: (a: number) => [number, number];
  readonly digest_fromHex: (a: number, b: number) => [number, number, number];
  readonly digest_default: () => number;
  readonly __wbg_merkletree_free: (a: number, b: number) => void;
  readonly merkletree_new: (a: number, b: number) => number;
  readonly merkletree_root: (a: number) => [number, number, number];
  readonly merkletree_toWitness: (
    a: number
  ) => [number, number, number, number];
  readonly __wbg_heliaxkeys_free: (a: number, b: number) => void;
  readonly heliaxkeys_HELIAX_FEE_LOGIC_REF: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_LABEL_REF_WETH: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_LABEL_REF_USDC: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_LABEL_REF_XAN: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_VALUE_REF: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_NULLIFIER_KEY_COMMITMENT: () => [
    number,
    number,
  ];
  readonly heliaxkeys_HELIAX_FEE_DISCOVERY_PK: () => [number, number];
  readonly heliaxkeys_HELIAX_FEE_ENCRYPTION_PK: () => [number, number];
  readonly __wbg_resource_free: (a: number, b: number) => void;
  readonly resource_new: (a: any) => [number, number, number];
  readonly resource_create: (
    a: number,
    b: number,
    c: bigint,
    d: bigint,
    e: number,
    f: number,
    g: number,
    h: number
  ) => number;
  readonly resource_encode: (a: number) => any;
  readonly resource_decode: (a: any) => [number, number, number];
  readonly resource_commitment: (a: number) => number;
  readonly resource_nullifier: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly resource_fromBytes: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly __wbg_resourcewithlabel_free: (a: number, b: number) => void;
  readonly resourcewithlabel_fromEncrypted: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => [number, number, number];
  readonly resourcewithlabel_resource: (a: number) => number;
  readonly resourcewithlabel_forwarder: (a: number) => [number, number];
  readonly resourcewithlabel_erc20TokenAddress: (a: number) => [number, number];
  readonly __wbg_nullifierkey_free: (a: number, b: number) => void;
  readonly nullifierkey_new: (a: number, b: number) => [number, number, number];
  readonly nullifierkey_commit: (a: number) => number;
  readonly nullifierkey_inner: (a: number) => [number, number];
  readonly nullifierkey_random: () => number;
  readonly nullifierkey_toBase64: (a: number) => [number, number];
  readonly nullifierkey_fromBase64: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly nullifierkey_default: () => number;
  readonly __wbg_nullifierkeycommitment_free: (a: number, b: number) => void;
  readonly nullifierkeycommitment_new: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly nullifierkeycommitment_inner: (a: number) => number;
  readonly nullifierkeycommitment_toBase64: (a: number) => [number, number];
  readonly nullifierkeycommitment_fromBase64: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly __wbg_nullifierkeypair_free: (a: number, b: number) => void;
  readonly __wbg_get_nullifierkeypair_nk: (a: number) => number;
  readonly __wbg_set_nullifierkeypair_nk: (a: number, b: number) => void;
  readonly __wbg_get_nullifierkeypair_cnk: (a: number) => number;
  readonly __wbg_set_nullifierkeypair_cnk: (a: number, b: number) => void;
  readonly nullifierkeypair_new: (a: number, b: number) => number;
  readonly nullifierkeypair_toJson: (a: number) => [number, number, number];
  readonly nullifierkeypair_fromJson: (a: any) => [number, number, number];
  readonly nullifierkeypair_encode: (a: number) => any;
  readonly nullifierkeypair_decode: (a: any) => [number, number, number];
  readonly __wbg_authoritysigningkey_free: (a: number, b: number) => void;
  readonly authoritysigningkey_new: () => number;
  readonly authoritysigningkey_sign: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => number;
  readonly authoritysigningkey_authorize: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => [number, number, number];
  readonly authoritysigningkey_toBytes: (a: number) => [number, number];
  readonly authoritysigningkey_fromBytes: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly __wbg_authoritysignature_free: (a: number, b: number) => void;
  readonly authoritysignature_toBytes: (a: number) => [number, number];
  readonly authoritysignature_fromBytes: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly __wbg_authorityverifyingkey_free: (a: number, b: number) => void;
  readonly authorityverifyingkey_new: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly authorityverifyingkey_fromSigningKey: (a: number) => number;
  readonly authorityverifyingkey_verify: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => [number, number];
  readonly authorityverifyingkey_fromHex: (
    a: number,
    b: number
  ) => [number, number, number];
  readonly authorityverifyingkey_toBytes: (a: number) => [number, number];
  readonly __wbg_calltype_free: (a: number, b: number) => void;
  readonly calltype_toVec: (a: number) => [number, number];
  readonly calltype_Wrap: () => number;
  readonly calltype_Unwrap: () => number;
  readonly hashBytes: (a: number, b: number) => number;
  readonly hashTwo: (a: number, b: number) => number;
  readonly bytesToWords: (a: number, b: number) => [number, number];
  readonly wordsToBytes: (a: number, b: number) => [number, number];
  readonly sys_verify_integrity: (a: number, b: number) => void;
  readonly sys_verify_integrity2: (a: number, b: number) => void;
  readonly sys_read: (a: number, b: number, c: number) => number;
  readonly sys_read_words: (a: number, b: number, c: number) => number;
  readonly sys_sha_compress: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => void;
  readonly sys_prove_keccak: (a: number, b: number) => void;
  readonly sys_pause: (a: number, b: number) => void;
  readonly sys_halt: (a: number, b: number) => void;
  readonly sys_rand: (a: number, b: number) => void;
  readonly syscall_2_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number
  ) => void;
  readonly sys_cycle_count: () => bigint;
  readonly sys_log: (a: number, b: number) => void;
  readonly sys_input: (a: number) => number;
  readonly sys_panic: (a: number, b: number) => void;
  readonly sys_sha_buffer: (a: number, b: number, c: number, d: number) => void;
  readonly sys_poseidon2: (a: number, b: number, c: number, d: number) => void;
  readonly sys_bigint: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => void;
  readonly sys_write: (a: number, b: number, c: number) => void;
  readonly sys_getenv: (a: number, b: number, c: number, d: number) => number;
  readonly sys_argc: () => number;
  readonly sys_argv: (a: number, b: number, c: number) => number;
  readonly sys_alloc_words: (a: number) => number;
  readonly sys_alloc_aligned: (a: number, b: number) => number;
  readonly sys_fork: () => number;
  readonly sys_pipe: (a: number) => number;
  readonly sys_exit: (a: number) => void;
  readonly sys_keccak: (a: number, b: number) => number;
  readonly syscall_0: (a: number, b: number, c: number, d: number) => void;
  readonly syscall_0_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => void;
  readonly syscall_1: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => void;
  readonly syscall_1_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly syscall_2: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly syscall_3: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number
  ) => void;
  readonly syscall_3_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number
  ) => void;
  readonly syscall_4: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number
  ) => void;
  readonly syscall_4_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number
  ) => void;
  readonly syscall_5: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number
  ) => void;
  readonly syscall_5_nr: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number
  ) => void;
  readonly sys_bigint2_1: (a: number, b: number) => void;
  readonly sys_bigint2_2: (a: number, b: number, c: number) => void;
  readonly sys_bigint2_3: (a: number, b: number, c: number, d: number) => void;
  readonly sys_bigint2_4: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => void;
  readonly sys_bigint2_5: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly sys_bigint2_6: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number
  ) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(
  module: { module: SyncInitInput } | SyncInitInput
): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>
): Promise<InitOutput>;
