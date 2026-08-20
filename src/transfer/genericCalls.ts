import {
  Digest,
  hashBytes,
  NullifierKey,
  randomBytes,
  Resource,
} from "@anomaorg/arm-bindings";
import { fromHex, invariant, toBase64 } from "primitives";
import type {
  ConsumeIntent,
  CreateIntent,
  EvmCall,
  GenericCallInput,
  ResolvedParameters,
  SupportedChainConfig,
} from "types";
import { encodeAbiParameters, type Address, type Hex } from "viem";
import type { TransferBuilder } from "./models/TransferBuilder";

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
 * calldata. `value` stays a bigint: native withdrawals forward whole token
 * amounts in wei, which exceed `Number.MAX_SAFE_INTEGER`. `bigIntReplacer`
 * encodes it as a decimal string on the wire.
 */
export function serializeGenericCalls(calls: EvmCall[]): GenericCallInput[] {
  return calls.map(({ to, value, data }) => ({
    to,
    value,
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
  const nullifierKey = params.nullifierKey ?? NullifierKey.zero();
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

/**
 * Appends the generic-call compliance unit to already-resolved parameters: an
 * ephemeral, quantity-0 resource carrying `calls`, balanced by a padding
 * resource so the unit nets to zero.
 *
 * Pair it with a transfer leg that sends the tokens to
 * `chain.genericCallForwarderAddress`, so the forwarder holds the funds the
 * calls operate on. Used by the native-withdraw flow (unwrap WETH and forward
 * the native tokens); the same shape is inlined in {@link SwapResolver}.
 */
export function appendGenericCallLeg(
  resolved: ResolvedParameters,
  params: {
    transferBuilder: TransferBuilder;
    chain: SupportedChainConfig;
    calls: EvmCall[];
  }
): ResolvedParameters {
  const { transferBuilder, chain, calls } = params;
  const { genericCallLogicVerifyingKey, genericCallForwarderAddress } = chain;
  invariant(
    genericCallLogicVerifyingKey,
    "Backend is missing the generic-call logic verifying key"
  );

  const resource = createGenericCallResource({
    logicVerifyingKey: genericCallLogicVerifyingKey,
    forwarderAddress: genericCallForwarderAddress,
    calls,
  });

  const consume: ConsumeIntent = {
    type: "GenericCall",
    forwarderAddress: genericCallForwarderAddress,
    calls,
    resource,
    nullifierKey: NullifierKey.zero(),
  };
  const padding: CreateIntent = {
    resource: transferBuilder.client.createPaddingResource({
      nullifierKey: NullifierKey.zero(),
      resource,
    }),
    receiver: undefined,
  };

  return {
    consumeIntents: [...resolved.consumeIntents, consume],
    createIntents: [...resolved.createIntents, padding],
  };
}
