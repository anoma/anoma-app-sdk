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
 * `Vec<Call>::abi_encode()` used by the witness library's `calculate_label_ref`,
 * so the resulting `label_ref` agrees with the backend's logic proof.
 */
export function encodeGenericCalls(calls: EvmCall[]): Hex {
  return encodeAbiParameters(CALL_ABI_PARAMETERS, [
    calls.map(({ to, value, data }) => ({ to, value, data })),
  ]);
}

/**
 * Computes `label_ref = hash(forwarder_addr ‖ abi_encode(calls))`, the kind
 * label for a generic-call resource.
 */
export function calculateGenericCallLabelRef(
  forwarderAddress: Address,
  calls: EvmCall[]
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const callsBytes = fromHex(encodeGenericCalls(calls));
  return hashBytes(new Uint8Array([...forwarderBytes, ...callsBytes]));
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
    calculateGenericCallLabelRef(forwarderAddress, calls),
    0n,
    Digest.default(),
    true,
    nonce,
    nullifierKey.commit()
  );
}
