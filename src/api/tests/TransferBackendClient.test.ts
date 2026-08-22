import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Parameters } from "../../transfer/types/resources";
import { TransferBackendClient } from "../TransferBackendClient";

const resource = { logicRef: "0x1", nkCommitment: "0x2", isEphemeral: false };
const parameters = {
  createdResources: [{ resource }],
  consumedResources: [{ resource }],
} as unknown as Parameters;

const postedBody = () =>
  JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);

describe("TransferBackendClient", () => {
  const client = new TransferBackendClient("https://backend.test");

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 }))
    );
  });

  it("sends transfer resources as snake_case", async () => {
    await client.transfer("ethereum", parameters);
    expect(postedBody().createdResources[0].resource).toEqual({
      logic_ref: "0x1",
      nk_commitment: "0x2",
      is_ephemeral: false,
    });
  });

  it("sends fee estimate resources as snake_case", async () => {
    await client.estimateFee("ethereum", {
      feeToken: "usdc",
      transaction: parameters,
    });
    expect(postedBody().transaction.consumedResources[0].resource).toEqual({
      logic_ref: "0x1",
      nk_commitment: "0x2",
      is_ephemeral: false,
    });
  });

  it("sends duration estimate resources as snake_case", async () => {
    await client.estimateDuration("ethereum", parameters);
    expect(postedBody().consumedResources[0].resource).toEqual({
      logic_ref: "0x1",
      nk_commitment: "0x2",
      is_ephemeral: false,
    });
  });
});
