import type {
  EncodedResource,
  NullifierKey,
  Resource,
} from "@anomaorg/arm-bindings";
import { fromHex, toBase64 } from "primitives";
import type { AppResource } from "types";
import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachNullifiers,
  isLegacyResource,
  LEGACY_TRANSFER_LOGIC_REF,
  selectTransferResources,
  type ResourceWithNullifier,
} from "../services";

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
  transactionTimestamp: 0,
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

describe("selectTransferResources", () => {
  const LEGACY = toBase64(fromHex(LEGACY_TRANSFER_LOGIC_REF));
  const V2 = toBase64(new Uint8Array(32).fill(1));

  const appResource = (
    nonce: string,
    quantity: bigint,
    logicRef: string
  ): AppResource => ({ nonce, quantity, logicRef }) as unknown as AppResource;

  const pick = (resources: AppResource[], target: bigint) =>
    selectTransferResources(resources, target).map(
      ({ resource, targetAmount }) => [resource.nonce, targetAmount]
    );

  it("recognises the legacy logic ref in its base64 encoding", () => {
    expect(isLegacyResource(appResource("a", 1n, LEGACY))).toBe(true);
    expect(isLegacyResource(appResource("b", 1n, V2))).toBe(false);
    expect(
      isLegacyResource(appResource("c", 1n, LEGACY_TRANSFER_LOGIC_REF))
    ).toBe(false);
  });

  it("spends only legacy resources when they cover the amount", () => {
    const resources = [
      appResource("v2-big", 100n, V2),
      appResource("legacy-a", 30n, LEGACY),
      appResource("legacy-b", 20n, LEGACY),
    ];

    expect(pick(resources, 40n)).toEqual([
      ["legacy-a", 30n],
      ["legacy-b", 10n],
    ]);
  });

  it("spends every legacy resource and covers the rest with v2", () => {
    const resources = [
      appResource("v2-big", 100n, V2),
      appResource("v2-small", 15n, V2),
      appResource("legacy-a", 30n, LEGACY),
      appResource("legacy-b", 20n, LEGACY),
    ];

    expect(pick(resources, 60n)).toEqual([
      ["legacy-a", 30n],
      ["legacy-b", 20n],
      ["v2-big", 10n],
    ]);
  });

  it("keeps the fewest-UTXO selection when there are no legacy resources", () => {
    const resources = [
      appResource("a", 100n, V2),
      appResource("b", 30n, V2),
      appResource("c", 20n, V2),
    ];

    expect(pick(resources, 50n)).toEqual([
      ["b", 30n],
      ["c", 20n],
    ]);
  });

  it("throws when legacy and v2 together fall short", () => {
    const resources = [
      appResource("legacy", 10n, LEGACY),
      appResource("v2", 5n, V2),
    ];

    expect(() => selectTransferResources(resources, 20n)).toThrow(
      "required 20, available 15"
    );
  });
});
