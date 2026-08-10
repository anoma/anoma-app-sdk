/// <reference types="node" />
import { readFileSync } from "node:fs";
import type { 
  EvmCall, 
  ResolvedParameters, 
  SupportedChainConfig,
} from "types";
import { beforeAll, describe, expect, it } from "vitest";
import { initWasm } from "wasm";
import {
  appendGenericCallLeg,
  calculateGenericCallLabelRef,
  calculateGenericCallValueRef,
  encodeGenericCalls,
  serializeGenericCalls,
} from "../genericCalls";
import type { TransferBuilder } from "../models/TransferBuilder";
import { TransferLogic } from "../models/TransferLogic";

beforeAll(async () => {
  const wasmBytes = readFileSync(
    new URL("../../../wasm/arm_bindings_bg.wasm", import.meta.url)
  );
  await initWasm(new Uint8Array(wasmBytes));
});

const CALLS: EvmCall[] = [
  { to: "0x1111111111111111111111111111111111111111", value: 0n, data: "0x" },
  {
    to: "0x2222222222222222222222222222222222222222",
    value: 0n,
    data: "0xdeadbeef",
  },
];

describe("encodeGenericCalls", () => {
  // Golden vector: must byte-match the on-chain `abi.decode(input, (Call[]))`
  // in GenericCallForwarder and Alloy's `Vec<Call>::abi_encode()` in the
  // witness circuit. If this changes, `value_ref` no longer agrees with the
  // backend logic proof. Includes the leading 0x20 offset word.
  it("matches the on-chain Call[] ABI encoding (golden vector)", () => {
    expect(encodeGenericCalls(CALLS)).toBe(
      "0x" +
        "0000000000000000000000000000000000000000000000000000000000000020" +
        "0000000000000000000000000000000000000000000000000000000000000002" +
        "0000000000000000000000000000000000000000000000000000000000000040" +
        "00000000000000000000000000000000000000000000000000000000000000c0" +
        "0000000000000000000000001111111111111111111111111111111111111111" +
        "0000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000060" +
        "0000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000002222222222222222222222222222222222222222" +
        "0000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000060" +
        "0000000000000000000000000000000000000000000000000000000000000004" +
        "deadbeef00000000000000000000000000000000000000000000000000000000"
    );
  });

  it("produces distinct encodings for distinct calls", () => {
    const other: EvmCall[] = [{ ...CALLS[0], data: "0xbeef" }];
    expect(encodeGenericCalls(other)).not.toBe(encodeGenericCalls(CALLS));
  });
});

describe("calculateGenericCallLabelRef / ValueRef", () => {
  it("label_ref depends only on the forwarder address", () => {
    const a = calculateGenericCallLabelRef(
      "0x1111111111111111111111111111111111111111"
    );
    const b = calculateGenericCallLabelRef(
      "0x1111111111111111111111111111111111111111"
    );
    const c = calculateGenericCallLabelRef(
      "0x2222222222222222222222222222222222222222"
    );
    expect(a.toHex()).toBe(b.toHex());
    expect(a.toHex()).not.toBe(c.toHex());
  });

  it("value_ref is deterministic and binds the calls", () => {
    expect(calculateGenericCallValueRef(CALLS).toHex()).toBe(
      calculateGenericCallValueRef(CALLS).toHex()
    );
    const other: EvmCall[] = [{ ...CALLS[0], data: "0xbeef" }];
    expect(calculateGenericCallValueRef(other).toHex()).not.toBe(
      calculateGenericCallValueRef(CALLS).toHex()
    );
  });
});

describe("serializeGenericCalls", () => {
  it("base64-encodes calldata and passes through zero values", () => {
    expect(serializeGenericCalls(CALLS)).toEqual([
      { to: CALLS[0].to, value: 0, data: "" },
      { to: CALLS[1].to, value: 0, data: "3q2+7w==" }, // deadbeef
    ]);
  });

  it("throws rather than silently corrupting values above 2^53", () => {
    const big: EvmCall[] = [
      {
        to: "0x1111111111111111111111111111111111111111",
        value: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        data: "0x",
      },
    ];
    expect(() => serializeGenericCalls(big)).toThrow(/exceeds/);
  });
});

describe("appendGenericCallLeg", () => {
  const chain = {
    genericCallForwarderAddress: "0x3333333333333333333333333333333333333333",
    genericCallLogicVerifyingKey:
      "de1d88738d93b2c67bcd7d2515e22a093bbf7f08ecd88ab24030c301a416621a",
  } as SupportedChainConfig;

  // Only `client.createPaddingResource` is reached, and that needs nothing but
  // the trivial logic key — `TransferLogic.init` would require wasm bootstrap.
  const client = new TransferLogic(
    "0000000000000000000000000000000000000000000000000000000000000001"
  );
  client.trivialLogicVerifyingKey =
    "0000000000000000000000000000000000000000000000000000000000000002";
  const transferBuilder = { client } as TransferBuilder;

  const existing: ResolvedParameters = {
    consumeIntents: [],
    createIntents: [],
  };

  it("appends exactly one consume and one create intent", () => {
    const result = appendGenericCallLeg(existing, {
      transferBuilder,
      chain,
      calls: CALLS,
    });

    expect(result.consumeIntents).toHaveLength(1);
    expect(result.createIntents).toHaveLength(1);
    expect(result.consumeIntents[0]).toMatchObject({
      type: "GenericCall",
      forwarderAddress: chain.genericCallForwarderAddress,
      calls: CALLS,
    });
    expect(result.createIntents[0].receiver).toBeUndefined();
  });

  it("preserves the input intents, in order, ahead of the new ones", () => {
    const first = appendGenericCallLeg(existing, {
      transferBuilder,
      chain,
      calls: CALLS,
    });
    const second = appendGenericCallLeg(first, {
      transferBuilder,
      chain,
      calls: CALLS,
    });

    expect(second.consumeIntents).toHaveLength(2);
    expect(second.consumeIntents[0]).toBe(first.consumeIntents[0]);
    // The input is not mutated.
    expect(first.consumeIntents).toHaveLength(1);
    expect(existing.consumeIntents).toHaveLength(0);
  });

  it("throws when the backend did not supply the generic-call logic key", () => {
    expect(() =>
      appendGenericCallLeg(existing, {
        transferBuilder,
        chain: { ...chain, genericCallLogicVerifyingKey: "" },
        calls: CALLS,
      })
    ).toThrow(/generic-call logic verifying key/);
  });
});
