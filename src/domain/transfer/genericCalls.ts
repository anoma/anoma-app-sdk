import { fromHex, toBase64 } from "lib/utils";
import type { EvmCall, GenericCallInput } from "types";
import { encodeAbiParameters, type Address, type Hex } from "viem";
import { Digest, hashBytes, NullifierKey, randomBytes, Resource } from "wasm";

/**
 * ABI tuple for the `Call { address to; uint256 value; bytes data }` struct
 * that the `GenericCallForwarder` decodes via `abi.decode(input, (Call[]))`.
 */
const CALL_ABI_PARAMETERS = [
  {
    type: "tuple[]",
    components: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  },
] as const;

/**
 * ABI-encodes `calls` as `Call[]`. This matches both the on-chain
 * `abi.decode(input, (Call[]))` in `GenericCallForwarder.forwardCall` and the
 * `Vec<Call>::abi_encode()` used by the witness library's `calculate_value_ref`,
 * so the resulting `value_ref` agrees with the backend's logic proof. (Alloy's
 * `abi_encode` includes the leading `0x20` offset word, same as viem here.)
 */
export function encodeGenericCalls(calls: EvmCall[]): Hex {
  return encodeAbiParameters(CALL_ABI_PARAMETERS, [
    calls.map(({ to, value, data }) => ({ to, value, data })),
  ]);
}

/**
 * Computes `label_ref = hash(forwarder_addr)`, the kind label for a
 * generic-call resource. Matches the witness circuit's `calculate_label_ref`.
 * The calls are bound separately via `value_ref`, not the label.
 */
export function calculateGenericCallLabelRef(
  forwarderAddress: Address
): Digest {
  return hashBytes(fromHex(forwarderAddress));
}

/**
 * Computes `value_ref = hash(abi_encode(calls))`, binding the exact EVM calls
 * to the generic-call resource. Matches the witness circuit's
 * `hash_bytes(Vec<Call>::abi_encode())`.
 */
export function calculateGenericCallValueRef(calls: EvmCall[]): Digest {
  return hashBytes(fromHex(encodeGenericCalls(calls)));
}

/**
 * Serializes raw EVM calls into the backend witness shape, base64-encoding the
 * calldata. `value` is narrowed to a JS number; swap calls always use 0 (wei),
 * so no precision is lost.
 */
export function serializeGenericCalls(calls: EvmCall[]): GenericCallInput[] {
  return calls.map(({ to, value, data }) => ({
    to,
    value: Number(value),
    data: toBase64(fromHex(data)),
  }));
}

/**
 * Builds the ephemeral, quantity-0 generic-call resource that is consumed to
 * carry the swap's EVM calls. Its `logic_ref` is the generic-call logic
 * verifying key (from backend config) and its `label_ref` binds the forwarder
 * and the exact calls. Defaults to the trivial nullifier key (the resource is
 * unowned) and a random nonce to keep its nullifier unique within the tx.
 */
export function createGenericCallResource(params: {
  logicVerifyingKey: string;
  forwarderAddress: Address;
  calls: EvmCall[];
  nullifierKey?: NullifierKey;
  nonce?: Digest;
}): Resource {
  const { logicVerifyingKey, forwarderAddress, calls } = params;
  const nullifierKey = params.nullifierKey ?? NullifierKey.default();
  const nonce = params.nonce ?? Digest.fromBytes(randomBytes());
  return Resource.create(
    Digest.fromHex(logicVerifyingKey),
    calculateGenericCallLabelRef(forwarderAddress),
    0n,
    calculateGenericCallValueRef(calls),
    true,
    nonce,
    nullifierKey.commit()
  );
}
