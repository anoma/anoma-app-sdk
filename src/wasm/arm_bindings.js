let wasm;

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function getArrayU32FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
  if (
    cachedUint32ArrayMemory0 === null ||
    cachedUint32ArrayMemory0.byteLength === 0
  ) {
    cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
  }
  return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null ||
    cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 4, 4) >>> 0;
  getUint32ArrayMemory0().set(arg, ptr / 4);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i]);
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true,
    });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len)
  );
}

const cachedTextEncoder = new TextEncoder();

if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
    };
  };
}

let WASM_VECTOR_LEN = 0;

const AuthorizationSignatureFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr =>
      wasm.__wbg_authorizationsignature_free(ptr >>> 0, 1)
    );

const AuthorizationSigningKeyFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr =>
      wasm.__wbg_authorizationsigningkey_free(ptr >>> 0, 1)
    );

const AuthorizationVerifyingKeyFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr =>
      wasm.__wbg_authorizationverifyingkey_free(ptr >>> 0, 1)
    );

const CallTypeFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_calltype_free(ptr >>> 0, 1));

const CiphertextFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_ciphertext_free(ptr >>> 0, 1));

const DigestFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_digest_free(ptr >>> 0, 1));

const InitialRootFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_initialroot_free(ptr >>> 0, 1));

const KeypairFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_keypair_free(ptr >>> 0, 1));

const MerkleTreeFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_merkletree_free(ptr >>> 0, 1));

const NullifierKeyFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_nullifierkey_free(ptr >>> 0, 1));

const NullifierKeyCommitmentFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr =>
      wasm.__wbg_nullifierkeycommitment_free(ptr >>> 0, 1)
    );

const NullifierKeyPairFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr =>
      wasm.__wbg_nullifierkeypair_free(ptr >>> 0, 1)
    );

const PublicKeyFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_publickey_free(ptr >>> 0, 1));

const ResourceFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_resource_free(ptr >>> 0, 1));

const SecretKeyFinalization =
  typeof FinalizationRegistry === "undefined" ?
    { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_secretkey_free(ptr >>> 0, 1));

export class AuthorizationSignature {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AuthorizationSignature.prototype);
    obj.__wbg_ptr = ptr;
    AuthorizationSignatureFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AuthorizationSignatureFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_authorizationsignature_free(ptr, 0);
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.authorizationsignature_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {AuthorizationSignature}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.authorizationsignature_fromBytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return AuthorizationSignature.__wrap(ret[0]);
  }
}
if (Symbol.dispose)
  AuthorizationSignature.prototype[Symbol.dispose] =
    AuthorizationSignature.prototype.free;

export class AuthorizationSigningKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AuthorizationSigningKey.prototype);
    obj.__wbg_ptr = ptr;
    AuthorizationSigningKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AuthorizationSigningKeyFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_authorizationsigningkey_free(ptr, 0);
  }
  constructor() {
    const ret = wasm.authorizationsigningkey_new();
    this.__wbg_ptr = ret >>> 0;
    AuthorizationSigningKeyFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {string} domain
   * @param {Uint8Array} message
   * @returns {AuthorizationSignature}
   */
  sign(domain, message) {
    const ptr0 = passStringToWasm0(
      domain,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.authorizationsigningkey_sign(
      this.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1
    );
    return AuthorizationSignature.__wrap(ret);
  }
  /**
   * @param {string} domain
   * @param {MerkleTree} action_tree
   * @returns {AuthorizationSignature}
   */
  authorize(domain, action_tree) {
    const ptr0 = passStringToWasm0(
      domain,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    _assertClass(action_tree, MerkleTree);
    const ret = wasm.authorizationsigningkey_authorize(
      this.__wbg_ptr,
      ptr0,
      len0,
      action_tree.__wbg_ptr
    );
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return AuthorizationSignature.__wrap(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.authorizationsigningkey_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {AuthorizationSigningKey}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.authorizationsigningkey_fromBytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return AuthorizationSigningKey.__wrap(ret[0]);
  }
}
if (Symbol.dispose)
  AuthorizationSigningKey.prototype[Symbol.dispose] =
    AuthorizationSigningKey.prototype.free;

export class AuthorizationVerifyingKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AuthorizationVerifyingKey.prototype);
    obj.__wbg_ptr = ptr;
    AuthorizationVerifyingKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AuthorizationVerifyingKeyFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_authorizationverifyingkey_free(ptr, 0);
  }
  /**
   * @param {AuthorizationSigningKey} signing_key
   * @returns {AuthorizationVerifyingKey}
   */
  static fromSigningKey(signing_key) {
    _assertClass(signing_key, AuthorizationSigningKey);
    const ret = wasm.authorizationverifyingkey_fromSigningKey(
      signing_key.__wbg_ptr
    );
    return AuthorizationVerifyingKey.__wrap(ret);
  }
  /**
   * @param {string} domain
   * @param {Uint8Array} message
   * @param {AuthorizationSignature} signature
   */
  verify(domain, message, signature) {
    const ptr0 = passStringToWasm0(
      domain,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(signature, AuthorizationSignature);
    const ret = wasm.authorizationverifyingkey_verify(
      this.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      signature.__wbg_ptr
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} pk_hex
   * @returns {AuthorizationVerifyingKey}
   */
  static fromHex(pk_hex) {
    const ptr0 = passStringToWasm0(
      pk_hex,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.authorizationverifyingkey_fromHex(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return AuthorizationVerifyingKey.__wrap(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.authorizationverifyingkey_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
}
if (Symbol.dispose)
  AuthorizationVerifyingKey.prototype[Symbol.dispose] =
    AuthorizationVerifyingKey.prototype.free;

export class CallType {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(CallType.prototype);
    obj.__wbg_ptr = ptr;
    CallTypeFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CallTypeFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_calltype_free(ptr, 0);
  }
  /**
   * @returns {Uint8Array}
   */
  toVec() {
    const ret = wasm.calltype_toVec(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {CallType}
   */
  static get Wrap() {
    const ret = wasm.calltype_Wrap();
    return CallType.__wrap(ret);
  }
  /**
   * @returns {CallType}
   */
  static get Unwrap() {
    const ret = wasm.calltype_Unwrap();
    return CallType.__wrap(ret);
  }
}
if (Symbol.dispose)
  CallType.prototype[Symbol.dispose] = CallType.prototype.free;

export class Ciphertext {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Ciphertext.prototype);
    obj.__wbg_ptr = ptr;
    CiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CiphertextFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_ciphertext_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {Ciphertext}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.ciphertext_fromBytes(ptr0, len0);
    return Ciphertext.__wrap(ret);
  }
  /**
   * @param {Uint32Array} words
   * @returns {Ciphertext}
   */
  static fromWords(words) {
    const ptr0 = passArray32ToWasm0(words, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.ciphertext_fromWords(ptr0, len0);
    return Ciphertext.__wrap(ret);
  }
  /**
   * @returns {Uint8Array}
   */
  inner() {
    const ret = wasm.ciphertext_inner(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {Uint32Array}
   */
  asWords() {
    const ret = wasm.ciphertext_asWords(this.__wbg_ptr);
    var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * @param {Uint8Array} message
   * @param {PublicKey} receiver_pk
   * @param {SecretKey} sender_sk
   * @returns {Ciphertext}
   */
  static encrypt(message, receiver_pk, sender_sk) {
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(receiver_pk, PublicKey);
    var ptr1 = receiver_pk.__destroy_into_raw();
    _assertClass(sender_sk, SecretKey);
    var ptr2 = sender_sk.__destroy_into_raw();
    const ret = wasm.ciphertext_encrypt(ptr0, len0, ptr1, ptr2);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Ciphertext.__wrap(ret[0]);
  }
  /**
   * @param {SecretKey} sk
   * @returns {Uint8Array}
   */
  decrypt(sk) {
    _assertClass(sk, SecretKey);
    const ret = wasm.ciphertext_decrypt(this.__wbg_ptr, sk.__wbg_ptr);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {any}
   */
  toJson() {
    const ret = wasm.ciphertext_toJson(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
}
if (Symbol.dispose)
  Ciphertext.prototype[Symbol.dispose] = Ciphertext.prototype.free;

export class Digest {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Digest.prototype);
    obj.__wbg_ptr = ptr;
    DigestFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  static __unwrap(jsValue) {
    if (!(jsValue instanceof Digest)) {
      return 0;
    }
    return jsValue.__destroy_into_raw();
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DigestFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_digest_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} bytes
   */
  constructor(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.digest_new(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    DigestFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {Digest}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.digest_fromBytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Digest.__wrap(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.digest_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {string}
   */
  toHex() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.digest_toHex(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} hex
   * @returns {Digest}
   */
  static fromHex(hex) {
    const ptr0 = passStringToWasm0(
      hex,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.digest_fromHex(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Digest.__wrap(ret[0]);
  }
  /**
   * @returns {Digest}
   */
  static default() {
    const ret = wasm.digest_default();
    return Digest.__wrap(ret);
  }
}
if (Symbol.dispose) Digest.prototype[Symbol.dispose] = Digest.prototype.free;

export class InitialRoot {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    InitialRootFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_initialroot_free(ptr, 0);
  }
  /**
   * @returns {Uint8Array}
   */
  static bytes() {
    const ret = wasm.initialroot_bytes();
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
}
if (Symbol.dispose)
  InitialRoot.prototype[Symbol.dispose] = InitialRoot.prototype.free;

export class Keypair {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Keypair.prototype);
    obj.__wbg_ptr = ptr;
    KeypairFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    KeypairFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_keypair_free(ptr, 0);
  }
  /**
   * @returns {SecretKey}
   */
  get sk() {
    const ret = wasm.__wbg_get_keypair_sk(this.__wbg_ptr);
    return SecretKey.__wrap(ret);
  }
  /**
   * @param {SecretKey} arg0
   */
  set sk(arg0) {
    _assertClass(arg0, SecretKey);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_keypair_sk(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {PublicKey}
   */
  get pk() {
    const ret = wasm.__wbg_get_keypair_pk(this.__wbg_ptr);
    return PublicKey.__wrap(ret);
  }
  /**
   * @param {PublicKey} arg0
   */
  set pk(arg0) {
    _assertClass(arg0, PublicKey);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_keypair_pk(this.__wbg_ptr, ptr0);
  }
  /**
   * @param {Uint8Array} sk_bytes
   * @param {Uint8Array} pk_bytes
   * @returns {Keypair}
   */
  static new(sk_bytes, pk_bytes) {
    const ptr0 = passArray8ToWasm0(sk_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(pk_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.keypair_new(ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Keypair.__wrap(ret[0]);
  }
  /**
   * @returns {EncodedKeypair}
   */
  encode() {
    const ret = wasm.keypair_encode(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {EncodedKeypair} encoded
   * @returns {Keypair}
   */
  static decode(encoded) {
    const ret = wasm.keypair_decode(encoded);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Keypair.__wrap(ret[0]);
  }
  /**
   * @returns {Keypair}
   */
  static random() {
    const ret = wasm.keypair_random();
    return Keypair.__wrap(ret);
  }
  /**
   * @returns {Uint8Array}
   */
  serialize() {
    const ret = wasm.keypair_serialize(this.__wbg_ptr);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {SecretKey}
   */
  static deserialize(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.keypair_deserialize(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return SecretKey.__wrap(ret[0]);
  }
}
if (Symbol.dispose) Keypair.prototype[Symbol.dispose] = Keypair.prototype.free;

export class MerkleTree {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    MerkleTreeFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_merkletree_free(ptr, 0);
  }
  /**
   * @param {Digest[]} leaves
   */
  constructor(leaves) {
    const ptr0 = passArrayJsValueToWasm0(leaves, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.merkletree_new(ptr0, len0);
    this.__wbg_ptr = ret >>> 0;
    MerkleTreeFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {Digest}
   */
  root() {
    const ret = wasm.merkletree_root(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Digest.__wrap(ret[0]);
  }
  /**
   * Returns hex string representing the actionTreeRoot bytes needed for
   * Permit2 signing. This is only available in a browser wasm target.
   * @returns {string}
   */
  toWitness() {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret = wasm.merkletree_toWitness(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
}
if (Symbol.dispose)
  MerkleTree.prototype[Symbol.dispose] = MerkleTree.prototype.free;

export class NullifierKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NullifierKey.prototype);
    obj.__wbg_ptr = ptr;
    NullifierKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NullifierKeyFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nullifierkey_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} nk_bytes
   */
  constructor(nk_bytes) {
    const ptr0 = passArray8ToWasm0(nk_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nullifierkey_new(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    NullifierKeyFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {NullifierKeyCommitment}
   */
  commit() {
    const ret = wasm.nullifierkey_commit(this.__wbg_ptr);
    return NullifierKeyCommitment.__wrap(ret);
  }
  /**
   * @returns {Uint8Array}
   */
  inner() {
    const ret = wasm.nullifierkey_inner(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {NullifierKeyPair}
   */
  static random() {
    const ret = wasm.nullifierkey_random();
    return NullifierKeyPair.__wrap(ret);
  }
  /**
   * @returns {string}
   */
  toBase64() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.nullifierkey_toBase64(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} encoded
   * @returns {NullifierKey}
   */
  static fromBase64(encoded) {
    const ptr0 = passStringToWasm0(
      encoded,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nullifierkey_fromBase64(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return NullifierKey.__wrap(ret[0]);
  }
  /**
   * @returns {NullifierKey}
   */
  static default() {
    const ret = wasm.nullifierkey_default();
    return NullifierKey.__wrap(ret);
  }
}
if (Symbol.dispose)
  NullifierKey.prototype[Symbol.dispose] = NullifierKey.prototype.free;

export class NullifierKeyCommitment {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NullifierKeyCommitment.prototype);
    obj.__wbg_ptr = ptr;
    NullifierKeyCommitmentFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NullifierKeyCommitmentFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nullifierkeycommitment_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} nk_cmt_bytes
   */
  constructor(nk_cmt_bytes) {
    const ptr0 = passArray8ToWasm0(nk_cmt_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nullifierkeycommitment_new(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    NullifierKeyCommitmentFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {Digest}
   */
  inner() {
    const ret = wasm.nullifierkeycommitment_inner(this.__wbg_ptr);
    return Digest.__wrap(ret);
  }
  /**
   * @returns {string}
   */
  toBase64() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.nullifierkeycommitment_toBase64(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} encoded
   * @returns {NullifierKeyCommitment}
   */
  static fromBase64(encoded) {
    const ptr0 = passStringToWasm0(
      encoded,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nullifierkeycommitment_fromBase64(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return NullifierKeyCommitment.__wrap(ret[0]);
  }
}
if (Symbol.dispose)
  NullifierKeyCommitment.prototype[Symbol.dispose] =
    NullifierKeyCommitment.prototype.free;

export class NullifierKeyPair {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NullifierKeyPair.prototype);
    obj.__wbg_ptr = ptr;
    NullifierKeyPairFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NullifierKeyPairFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nullifierkeypair_free(ptr, 0);
  }
  /**
   * @returns {NullifierKey}
   */
  get nk() {
    const ret = wasm.__wbg_get_nullifierkeypair_nk(this.__wbg_ptr);
    return NullifierKey.__wrap(ret);
  }
  /**
   * @param {NullifierKey} arg0
   */
  set nk(arg0) {
    _assertClass(arg0, NullifierKey);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_nullifierkeypair_nk(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {NullifierKeyCommitment}
   */
  get cnk() {
    const ret = wasm.__wbg_get_nullifierkeypair_cnk(this.__wbg_ptr);
    return NullifierKeyCommitment.__wrap(ret);
  }
  /**
   * @param {NullifierKeyCommitment} arg0
   */
  set cnk(arg0) {
    _assertClass(arg0, NullifierKeyCommitment);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_nullifierkeypair_cnk(this.__wbg_ptr, ptr0);
  }
  /**
   * @param {NullifierKey} nk
   * @param {NullifierKeyCommitment} cnk
   */
  constructor(nk, cnk) {
    _assertClass(nk, NullifierKey);
    var ptr0 = nk.__destroy_into_raw();
    _assertClass(cnk, NullifierKeyCommitment);
    var ptr1 = cnk.__destroy_into_raw();
    const ret = wasm.nullifierkeypair_new(ptr0, ptr1);
    this.__wbg_ptr = ret >>> 0;
    NullifierKeyPairFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {any}
   */
  toJson() {
    const ret = wasm.nullifierkeypair_toJson(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {any} json
   * @returns {NullifierKeyPair}
   */
  static fromJson(json) {
    const ret = wasm.nullifierkeypair_fromJson(json);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return NullifierKeyPair.__wrap(ret[0]);
  }
  /**
   * @returns {EncodedNullifierKeyPair}
   */
  encode() {
    const ret = wasm.nullifierkeypair_encode(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {EncodedNullifierKeyPair} encoded
   * @returns {NullifierKeyPair}
   */
  static decode(encoded) {
    const ret = wasm.nullifierkeypair_decode(encoded);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return NullifierKeyPair.__wrap(ret[0]);
  }
}
if (Symbol.dispose)
  NullifierKeyPair.prototype[Symbol.dispose] = NullifierKeyPair.prototype.free;

export class PublicKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PublicKey.prototype);
    obj.__wbg_ptr = ptr;
    PublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PublicKeyFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_publickey_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} bytes
   */
  constructor(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.publickey_new(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    PublicKeyFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {string} pk_b64
   * @returns {PublicKey}
   */
  static fromBase64(pk_b64) {
    const ptr0 = passStringToWasm0(
      pk_b64,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.publickey_fromBase64(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return PublicKey.__wrap(ret[0]);
  }
  /**
   * @returns {string}
   */
  toBase64() {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret = wasm.publickey_toBase64(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {string} pk_hex
   * @returns {PublicKey}
   */
  static fromHex(pk_hex) {
    const ptr0 = passStringToWasm0(
      pk_hex,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.publickey_fromHex(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return PublicKey.__wrap(ret[0]);
  }
  /**
   * @returns {string}
   */
  toHex() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.publickey_toHex(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.publickey_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @returns {Uint8Array}
   */
  serialize() {
    const ret = wasm.publickey_serialize(this.__wbg_ptr);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {PublicKey}
   */
  static deserialize(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.publickey_deserialize(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return PublicKey.__wrap(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  encode() {
    const ret = wasm.publickey_encode(this.__wbg_ptr);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
}
if (Symbol.dispose)
  PublicKey.prototype[Symbol.dispose] = PublicKey.prototype.free;

export class Resource {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Resource.prototype);
    obj.__wbg_ptr = ptr;
    ResourceFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ResourceFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_resource_free(ptr, 0);
  }
  /**
   * @param {ResourceProps} props
   */
  constructor(props) {
    const ret = wasm.resource_new(props);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    ResourceFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {Digest} logic_ref
   * @param {Digest} label_ref
   * @param {bigint} quantity
   * @param {Digest} value_ref
   * @param {boolean} is_ephemeral
   * @param {Digest} nonce
   * @param {NullifierKeyCommitment} nk_cmt
   * @returns {Resource}
   */
  static create(
    logic_ref,
    label_ref,
    quantity,
    value_ref,
    is_ephemeral,
    nonce,
    nk_cmt
  ) {
    _assertClass(logic_ref, Digest);
    _assertClass(label_ref, Digest);
    _assertClass(value_ref, Digest);
    _assertClass(nonce, Digest);
    _assertClass(nk_cmt, NullifierKeyCommitment);
    const ret = wasm.resource_create(
      logic_ref.__wbg_ptr,
      label_ref.__wbg_ptr,
      quantity,
      quantity >> BigInt(64),
      value_ref.__wbg_ptr,
      is_ephemeral,
      nonce.__wbg_ptr,
      nk_cmt.__wbg_ptr
    );
    return Resource.__wrap(ret);
  }
  /**
   * @returns {EncodedResource}
   */
  encode() {
    const ret = wasm.resource_encode(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {EncodedResource} encoded
   * @returns {Resource}
   */
  static decode(encoded) {
    const ret = wasm.resource_decode(encoded);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Resource.__wrap(ret[0]);
  }
  /**
   * @returns {Digest}
   */
  commitment() {
    const ret = wasm.resource_commitment(this.__wbg_ptr);
    return Digest.__wrap(ret);
  }
  /**
   * @param {NullifierKey} nf_key
   * @returns {Digest}
   */
  nullifier(nf_key) {
    _assertClass(nf_key, NullifierKey);
    const ret = wasm.resource_nullifier(this.__wbg_ptr, nf_key.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Digest.__wrap(ret[0]);
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {Resource}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.resource_fromBytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Resource.__wrap(ret[0]);
  }
}
if (Symbol.dispose)
  Resource.prototype[Symbol.dispose] = Resource.prototype.free;

export class SecretKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(SecretKey.prototype);
    obj.__wbg_ptr = ptr;
    SecretKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SecretKeyFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_secretkey_free(ptr, 0);
  }
  /**
   * @param {Uint8Array} bytes
   */
  constructor(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.secretkey_new(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    SecretKeyFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {SecretKey}
   */
  static random() {
    const ret = wasm.secretkey_random();
    return SecretKey.__wrap(ret);
  }
  /**
   * @returns {PublicKey}
   */
  toPublicKey() {
    const ret = wasm.secretkey_toPublicKey(this.__wbg_ptr);
    return PublicKey.__wrap(ret);
  }
  /**
   * @param {Uint8Array} bytes
   * @returns {SecretKey}
   */
  static fromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.secretkey_fromBytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return SecretKey.__wrap(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    const ret = wasm.secretkey_toBytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * @param {string} sk_b64
   * @returns {SecretKey}
   */
  static fromBase64(sk_b64) {
    const ptr0 = passStringToWasm0(
      sk_b64,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.secretkey_fromBase64(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return SecretKey.__wrap(ret[0]);
  }
  /**
   * @returns {string}
   */
  toBase64() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.secretkey_toBase64(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} sk_hex
   * @returns {SecretKey}
   */
  static fromHex(sk_hex) {
    const ptr0 = passStringToWasm0(
      sk_hex,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.secretkey_fromHex(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return SecretKey.__wrap(ret[0]);
  }
  /**
   * @returns {string}
   */
  toHex() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.secretkey_toHex(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
if (Symbol.dispose)
  SecretKey.prototype[Symbol.dispose] = SecretKey.prototype.free;

/**
 * @param {Uint8Array} bytes
 * @returns {Uint32Array}
 */
export function bytesToWords(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.bytesToWords(ptr0, len0);
  var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v2;
}

/**
 * @param {bigint} value
 * @returns {Uint8Array}
 */
export function convertCounterToValueRef(value) {
  const ret = wasm.convertCounterToValueRef(value, value >> BigInt(64));
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}

/**
 * Bind reusable utils from arm-risc0
 * @param {Uint8Array} bytes
 * @returns {Digest}
 */
export function hashBytes(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.hashBytes(ptr0, len0);
  return Digest.__wrap(ret);
}

/**
 * @param {Digest} left
 * @param {Digest} right
 * @returns {Digest}
 */
export function hashTwo(left, right) {
  _assertClass(left, Digest);
  _assertClass(right, Digest);
  const ret = wasm.hashTwo(left.__wbg_ptr, right.__wbg_ptr);
  return Digest.__wrap(ret);
}

/**
 * Return a 32-byte randome vec
 * @returns {Uint8Array}
 */
export function randomBytes() {
  const ret = wasm.randomBytes();
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}

/**
 * @param {Uint32Array} words
 * @returns {Uint8Array}
 */
export function wordsToBytes(words) {
  const ptr0 = passArray32ToWasm0(words, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.wordsToBytes(ptr0, len0);
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}

const EXPECTED_RESPONSE_TYPES = new Set(["basic", "cors", "default"]);

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse =
          module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

        if (
          validResponse &&
          module.headers.get("Content-Type") !== "application/wasm"
        ) {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_Error_52673b7de5a0ca89 = function (arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_Number_2d1dcfcf4ec51736 = function (arg0) {
    const ret = Number(arg0);
    return ret;
  };
  imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function (arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_bigint_get_as_i64_6e32f5e6aff02e1d = function (
    arg0,
    arg1
  ) {
    const v = arg1;
    const ret = typeof v === "bigint" ? v : undefined;
    getDataViewMemory0().setBigInt64(
      arg0 + 8 * 1,
      isLikeNone(ret) ? BigInt(0) : ret,
      true
    );
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
  };
  imports.wbg.__wbg___wbindgen_boolean_get_dea25b33882b895b = function (arg0) {
    const v = arg0;
    const ret = typeof v === "boolean" ? v : undefined;
    return (
      isLikeNone(ret) ? 0xffffff
      : ret ? 1
      : 0
    );
  };
  imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function (
    arg0,
    arg1
  ) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_in_0d3e1e8f0c669317 = function (arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_bigint_0e1a2e3f55cfae27 = function (arg0) {
    const ret = typeof arg0 === "bigint";
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function (arg0) {
    const ret = typeof arg0 === "function";
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function (arg0) {
    const val = arg0;
    const ret = typeof val === "object" && val !== null;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function (arg0) {
    const ret = typeof arg0 === "string";
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function (arg0) {
    const ret = arg0 === undefined;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_jsval_eq_b6101cc9cef1fe36 = function (
    arg0,
    arg1
  ) {
    const ret = arg0 === arg1;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_jsval_loose_eq_766057600fdd1b0d = function (
    arg0,
    arg1
  ) {
    const ret = arg0 == arg1;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_number_get_9619185a74197f95 = function (
    arg0,
    arg1
  ) {
    const obj = arg1;
    const ret = typeof obj === "number" ? obj : undefined;
    getDataViewMemory0().setFloat64(
      arg0 + 8 * 1,
      isLikeNone(ret) ? 0 : ret,
      true
    );
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
  };
  imports.wbg.__wbg___wbindgen_shr_df5f0f11a6e22f2e = function (arg0, arg1) {
    const ret = arg0 >> arg1;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function (
    arg0,
    arg1
  ) {
    const obj = arg1;
    const ret = typeof obj === "string" ? obj : undefined;
    var ptr1 =
      isLikeNone(ret) ? 0 : (
        passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
      );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbg_call_3020136f7a2d6e44 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = arg0.call(arg1, arg2);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_call_abb4ff46ce38be40 = function () {
    return handleError(function (arg0, arg1) {
      const ret = arg0.call(arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_crypto_574e78ad8b13b65f = function (arg0) {
    const ret = arg0.crypto;
    return ret;
  };
  imports.wbg.__wbg_digest_unwrap = function (arg0) {
    const ret = Digest.__unwrap(arg0);
    return ret;
  };
  imports.wbg.__wbg_done_62ea16af4ce34b24 = function (arg0) {
    const ret = arg0.done;
    return ret;
  };
  imports.wbg.__wbg_getRandomValues_1c61fac11405ffdc = function () {
    return handleError(function (arg0, arg1) {
      globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function () {
    return handleError(function (arg0, arg1) {
      arg0.getRandomValues(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_get_6b7bd52aca3f9671 = function (arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
  };
  imports.wbg.__wbg_get_af9dab7e9603ea93 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.get(arg0, arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_get_with_ref_key_1dc361bd10053bfe = function (arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
  };
  imports.wbg.__wbg_instanceof_ArrayBuffer_f3320d2419cd0355 = function (arg0) {
    let result;
    try {
      result = arg0 instanceof ArrayBuffer;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_instanceof_Uint8Array_da54ccc9d3e09434 = function (arg0) {
    let result;
    try {
      result = arg0 instanceof Uint8Array;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_isArray_51fd9e6422c0a395 = function (arg0) {
    const ret = Array.isArray(arg0);
    return ret;
  };
  imports.wbg.__wbg_isSafeInteger_ae7d3f054d55fa16 = function (arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
  };
  imports.wbg.__wbg_iterator_27b7c8b35ab3e86b = function () {
    const ret = Symbol.iterator;
    return ret;
  };
  imports.wbg.__wbg_length_22ac23eaec9d8053 = function (arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_length_d45040a40c570362 = function (arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function (arg0) {
    const ret = arg0.msCrypto;
    return ret;
  };
  imports.wbg.__wbg_new_1ba21ce319a06297 = function () {
    const ret = new Object();
    return ret;
  };
  imports.wbg.__wbg_new_25f239778d6112b9 = function () {
    const ret = new Array();
    return ret;
  };
  imports.wbg.__wbg_new_6421f6084cc5bc5a = function (arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
  };
  imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function (arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_new_with_length_aa5eaf41d35235e5 = function (arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
  };
  imports.wbg.__wbg_next_138a17bbf04e926c = function (arg0) {
    const ret = arg0.next;
    return ret;
  };
  imports.wbg.__wbg_next_3cfe5c0fe2a4cc53 = function () {
    return handleError(function (arg0) {
      const ret = arg0.next();
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_node_905d3e251edff8a2 = function (arg0) {
    const ret = arg0.node;
    return ret;
  };
  imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function (arg0) {
    const ret = arg0.process;
    return ret;
  };
  imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function (
    arg0,
    arg1,
    arg2
  ) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
  };
  imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function () {
    return handleError(function (arg0, arg1) {
      arg0.randomFillSync(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_require_60cc747a6bc5215a = function () {
    return handleError(function () {
      const ret = module.require;
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_set_3f1d0b984ed272ed = function (arg0, arg1, arg2) {
    arg0[arg1] = arg2;
  };
  imports.wbg.__wbg_set_7df433eea03a5c14 = function (arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function () {
    const ret = typeof global === "undefined" ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function () {
    const ret = typeof globalThis === "undefined" ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function () {
    const ret = typeof self === "undefined" ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function () {
    const ret = typeof window === "undefined" ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_subarray_845f2f5bce7d061a = function (arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
  };
  imports.wbg.__wbg_value_57b7b035e117f7ee = function (arg0) {
    const ret = arg0.value;
    return ret;
  };
  imports.wbg.__wbg_versions_c01dfd4722a88165 = function (arg0) {
    const ret = arg0.versions;
    return ret;
  };
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function (arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_cast_4625c577ab2ec9ee = function (arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
  };
  imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function (arg0, arg1) {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function (arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
  };
  imports.wbg.__wbindgen_cast_e7b45dd881f38ce3 = function (arg0, arg1) {
    // Cast intrinsic for `U128 -> Externref`.
    const ret =
      BigInt.asUintN(64, arg0) | (BigInt.asUintN(64, arg1) << BigInt(64));
    return ret;
  };
  imports.wbg.__wbindgen_init_externref_table = function () {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
  };

  return imports;
}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedDataViewMemory0 = null;
  cachedUint32ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;

  wasm.__wbindgen_start();
  return wasm;
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  if (typeof module !== "undefined") {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn(
        "using deprecated parameters for `initSync()`; pass a single object instead"
      );
    }
  }

  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm;

  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn(
        "using deprecated parameters for the initialization function; pass a single object instead"
      );
    }
  }

  if (typeof module_or_path === "undefined") {
    module_or_path = new URL("arm_bindings_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (
    typeof module_or_path === "string" ||
    (typeof Request === "function" && module_or_path instanceof Request) ||
    (typeof URL === "function" && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path);
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports);

  return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
