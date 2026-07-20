import { SWAP_EXPIRATION_OFFSET_SECONDS } from "lib-constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

// SwapResolver reaches into the wasm module for resource construction; the
// deadline logic under test does not, so stub it out rather than initializing
// WebAssembly.
vi.mock("wasm", () => ({
  Digest: { fromBytes: vi.fn(), fromHex: vi.fn(), default: vi.fn() },
  Resource: { create: vi.fn(() => ({})) },
  NullifierKey: class {
    static default() {
      return {};
    }
  },
  hashBytes: vi.fn(() => ({})),
  randomBytes: vi.fn(() => new Uint8Array(32)),
}));

vi.mock("../genericCalls", () => ({
  createGenericCallResource: vi.fn(() => ({})),
}));

const addReceiver = vi.fn();
const build = vi.fn(() => ({ consumeIntents: [], createIntents: [] }));
vi.mock("../models/ParametersDraftResolver", () => ({
  ParametersDraftResolver: class {
    addReceiver = addReceiver;
    build = build;
  },
}));

vi.mock("lib/keyUtils", () => ({
  getUserPublicKeysFromKeyring: vi.fn(() => ({})),
}));

const { SwapResolver } = await import("../models/SwapResolver");

const chain = {
  genericCallForwarderAddress: "0x4220bcb4a9c755aee676c675ccc8a113e2a48274",
  forwarderAddress: "0x775c81a47f2618a8594a7a7f4a3df2a300337559",
  genericCallLogicVerifyingKey: "00",
  feePublicKeys: {},
} as never;

const keyring = { nullifierKeyPair: { nk: new Uint8Array(32) } } as never;

const transferBuilder = {
  client: {
    createPaddingResource: vi.fn(() => ({})),
    createMintResources: vi.fn(() => ({
      consumedResource: {},
      createdResource: {},
    })),
  },
} as never;

const input = {
  senderResources: [],
  tokenA: { address: "0xa", decimals: 6, symbol: "USDT" },
  tokenB: { address: "0xb", decimals: 6, symbol: "USDC" },
  swapAmount: 100_000n,
  minBuyAmount: 98_916n,
  calls: [],
  fee: 1_000n,
} as never;

/** Pulls the token-B wrap's Permit2 deadline out of the resolved intents. */
const resolvedDeadline = (offset?: number): number => {
  const resolver = new SwapResolver(transferBuilder, keyring, chain);
  const resolved =
    offset === undefined ?
      resolver.resolve(input)
    : resolver.resolve(input, offset);
  const wrap = resolved.consumeIntents.find(
    (i: { permit2Data?: { deadline: number } }) => i.permit2Data !== undefined
  ) as { permit2Data: { deadline: number } };
  return wrap.permit2Data.deadline;
};

describe("SwapResolver token-B wrap Permit2 deadline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    build.mockReturnValue({ consumeIntents: [], createIntents: [] });
  });

  it("defaults to the 30-minute swap expiration window", () => {
    const now = Math.floor(Date.now() / 1000);
    const deadline = resolvedDeadline();

    expect(SWAP_EXPIRATION_OFFSET_SECONDS).toBe(30 * 60);
    // Allow a couple of seconds of clock drift during the test.
    expect(deadline).toBeGreaterThanOrEqual(now + SWAP_EXPIRATION_OFFSET_SECONDS - 2);
    expect(deadline).toBeLessThanOrEqual(now + SWAP_EXPIRATION_OFFSET_SECONDS + 2);
  });

  it("leaves enough room to survive the review step", () => {
    // The previous default was 60 seconds, which expired while the user was
    // still on the review screen. The backend rejects an expired deadline at
    // the API boundary, against wall-clock rather than chain time.
    const now = Math.floor(Date.now() / 1000);
    expect(resolvedDeadline()).toBeGreaterThan(now + 10 * 60);
  });

  it("still honours an explicit override", () => {
    const now = Math.floor(Date.now() / 1000);
    const deadline = resolvedDeadline(120);
    expect(deadline).toBeGreaterThanOrEqual(now + 118);
    expect(deadline).toBeLessThanOrEqual(now + 122);
  });
});
