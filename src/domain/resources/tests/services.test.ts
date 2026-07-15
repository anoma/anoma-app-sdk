import type { EncodedResource, NullifierKey, Resource } from "@anomaorg/arm-bindings";
import type {
  IndexerId,
  NullifierRecord,
  NullifyingTransactionsResponse,
} from "api";
import type { SupportedChainConfig } from "types";
import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachNullifiers,
  buildAppResources,
  buildOptimisticTransactionLookup,
  buildTransactionLookup,
  type ResourceWithNullifier,
} from "../services";

const FORWARDER: Address = "0xf152bba809d6cba122579cee997a54b8f3fba417";
const CHAIN_ID = 11155111;
const NETWORK = "sepolia";

const chain = {
  network: NETWORK,
  chainId: CHAIN_ID,
  forwarderAddress: FORWARDER,
} as unknown as SupportedChainConfig;

const nullifyingResponse = (
  nullifiers: { tag: string; txHash: string; timestamp: number }[],
  chainId = CHAIN_ID
): NullifyingTransactionsResponse => [
  {
    chain_id: chainId,
    contract_address: FORWARDER,
    nullifiers: nullifiers.map(({ tag, txHash, timestamp }) => ({
      tag: tag as Address,
      transaction_hash: txHash as Address,
      timestamp,
    })),
  },
];

const optimisticRecord = (
  nullifier: string,
  txHash: Address,
  timestamp: number,
  chainId = CHAIN_ID
): NullifierRecord => {
  const id: IndexerId = `${chainId}_${txHash}`;
  return {
    id,
    nullifier: nullifier as Address,
    transaction: {
      id,
      evmTransaction: { id, chainId, txHash, timestamp },
    },
  };
};

const makeResource = (
  overrides: Partial<ResourceWithNullifier> = {}
): ResourceWithNullifier => ({
  resource: {} as Resource,
  encoded: {
    nonce: "nonce-1",
    is_ephemeral: false,
  } as unknown as EncodedResource,
  forwarder: FORWARDER,
  erc20TokenAddress: "0x0000000000000000000000000000000000000001",
  transactionHash: "AABBCCDD",
  nullifierHex: "aa11",
  ...overrides,
});

describe("buildTransactionLookup", () => {
  it("indexes endpoint nullifiers by normalized tag and by transaction hash", () => {
    const lookup = buildTransactionLookup(
      nullifyingResponse([
        { tag: "77A97714AB", txHash: "0x9AD8637D", timestamp: 1700000000 },
      ])
    );

    const tx = lookup.byNullifier.get("77a97714ab");
    expect(tx).toEqual({
      id: `${CHAIN_ID}_0x9ad8637d`,
      chainId: CHAIN_ID,
      txHash: "0x9ad8637d",
      timestamp: 1700000000,
    });
    expect(lookup.byTxHash.get("0x9ad8637d")).toBe(tx);
  });

  it("flattens nullifiers across multiple chain groups", () => {
    const lookup = buildTransactionLookup([
      ...nullifyingResponse(
        [{ tag: "aa", txHash: "0x01", timestamp: 1 }],
        CHAIN_ID
      ),
      ...nullifyingResponse([{ tag: "bb", txHash: "0x02", timestamp: 2 }], 1),
    ]);

    expect(lookup.byNullifier.get("aa")?.chainId).toBe(CHAIN_ID);
    expect(lookup.byNullifier.get("bb")?.chainId).toBe(1);
  });

  it("returns empty maps for an empty response", () => {
    const lookup = buildTransactionLookup([]);
    expect(lookup.byNullifier.size).toBe(0);
    expect(lookup.byTxHash.size).toBe(0);
  });
});

describe("buildOptimisticTransactionLookup", () => {
  it("masks a just-spent tag the indexer hasn't caught up to yet", () => {
    const { byNullifier, byTxHash, staleOptimisticTags } =
      buildOptimisticTransactionLookup(
        buildTransactionLookup([]),
        [optimisticRecord("0xAA", "0x02", 99)],
        ["aa"]
      );

    expect(byNullifier.get("aa")?.txHash).toBe("0x02");
    expect(byNullifier.get("aa")?.timestamp).toBe(99);
    expect(byTxHash.get("0x02")?.timestamp).toBe(99);
    expect(staleOptimisticTags).toHaveLength(0);
  });

  it("keeps the indexer entry and drops the optimistic tag once it's confirmed", () => {
    const record = optimisticRecord("0xAA", "0x02", 99);
    const { byNullifier, staleOptimisticTags } =
      buildOptimisticTransactionLookup(
        buildTransactionLookup(
          nullifyingResponse([{ tag: "aa", txHash: "0x01", timestamp: 1 }])
        ),
        [record],
        ["aa"]
      );

    // The indexer caught up, so its value wins and the optimistic tag is stale.
    expect(byNullifier.get("aa")?.txHash).toBe("0x01");
    expect(staleOptimisticTags).toEqual([record]);
  });

  it("drops an optimistic tag whose resource is no longer known", () => {
    const record = optimisticRecord("0xAA", "0x02", 99);
    const { byNullifier, staleOptimisticTags } =
      buildOptimisticTransactionLookup(
        buildTransactionLookup([]),
        [record],
        ["bb"]
      );

    expect(byNullifier.has("aa")).toBe(false);
    expect(staleOptimisticTags).toEqual([record]);
  });

  it("skips the resource-gone check when no known tags are provided", () => {
    const { byNullifier, staleOptimisticTags } =
      buildOptimisticTransactionLookup(buildTransactionLookup([]), [
        optimisticRecord("0xAA", "0x02", 99),
      ]);

    expect(byNullifier.get("aa")?.txHash).toBe("0x02");
    expect(staleOptimisticTags).toHaveLength(0);
  });
});

describe("buildAppResources", () => {
  it("includes available resources with a minimal createdIn fallback", () => {
    const [appResource] = buildAppResources(
      [chain],
      [makeResource({ transactionHash: "AABBCCDD" })],
      buildTransactionLookup([])
    );

    expect(appResource.consumedIn).toBeUndefined();
    expect(appResource.network).toBe(NETWORK);
    expect(appResource.createdIn).toEqual({
      id: `${CHAIN_ID}_0xaabbccdd`,
      chainId: CHAIN_ID,
      txHash: "0xaabbccdd",
      timestamp: 0,
    });
  });

  it("enriches createdIn from the lookup when the creating tx is indexed", () => {
    const lookup = buildTransactionLookup(
      nullifyingResponse([
        { tag: "ff", txHash: "0xAABBCCDD", timestamp: 1700000000 },
      ])
    );

    const [appResource] = buildAppResources(
      [chain],
      [makeResource({ transactionHash: "AABBCCDD" })],
      lookup
    );

    expect(appResource.createdIn?.timestamp).toBe(1700000000);
  });

  it("drops consumed resources when onlyAvailableResources is true", () => {
    const lookup = buildTransactionLookup(
      nullifyingResponse([{ tag: "aa11", txHash: "0x01", timestamp: 1 }])
    );

    const result = buildAppResources(
      [chain],
      [makeResource({ nullifierHex: "aa11" })],
      lookup
    );

    expect(result).toHaveLength(0);
  });

  it("keeps consumed resources with consumedIn when onlyAvailableResources is false", () => {
    const lookup = buildTransactionLookup(
      nullifyingResponse([{ tag: "aa11", txHash: "0x01", timestamp: 1 }])
    );

    const [appResource] = buildAppResources(
      [chain],
      [makeResource({ nullifierHex: "aa11" })],
      lookup,
      false
    );

    expect(appResource.consumedIn?.txHash).toBe("0x01");
  });

  it("drops resources whose forwarder has no configured chain", () => {
    const result = buildAppResources(
      [chain],
      [
        makeResource({
          forwarder: "0x000000000000000000000000000000000000dead",
        }),
      ],
      buildTransactionLookup([])
    );

    expect(result).toHaveLength(0);
  });
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
