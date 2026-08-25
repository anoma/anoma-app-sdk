import type { EncodedResource, NullifierKey, Resource } from "@anomaorg/arm-bindings";
import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import { attachNullifiers, type ResourceWithNullifier } from "../services";

const FORWARDER: Address = "0xf152bba809d6cba122579cee997a54b8f3fba417";
const CHAIN_ID = 11155111;

const makeResource = (
  overrides: Partial<ResourceWithNullifier> = {}
): ResourceWithNullifier => ({
  resource: {} as Resource,
  encoded: {
    nonce: "nonce-1",
    isEphemeral: false,
  } as unknown as EncodedResource,
  forwarder: FORWARDER,
  erc20TokenAddress: "0x0000000000000000000000000000000000000001",
  transactionHash: "AABBCCDD",
  chainId: CHAIN_ID,
  nullifierHex: "aa11",
  ...overrides,
});

describe("attachNullifiers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const nullifierKey = {} as NullifierKey;

  const stubResource = (result: string | Error): Resource =>
    ({
      nullifier: () => {
        if (result instanceof Error) throw result;
        return { toHex: () => result };
      },
    }) as unknown as Resource;

  it("attaches the normalized nullifier hex to each resource", () => {
    const [withNullifier] = attachNullifiers(
      [makeResource({ resource: stubResource("0xABCDEF") })],
      nullifierKey
    );

    expect(withNullifier.nullifierHex).toBe("abcdef");
  });

  it("drops resources whose nullifier cannot be computed and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = attachNullifiers(
      [
        makeResource({ resource: stubResource(new Error("boom")) }),
        makeResource({ resource: stubResource("0x11") }),
      ],
      nullifierKey
    );

    expect(result).toHaveLength(1);
    expect(result[0].nullifierHex).toBe("11");
    expect(warn).toHaveBeenCalledOnce();
  });
});
