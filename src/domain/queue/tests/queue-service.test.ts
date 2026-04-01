import { expect, test } from "vitest";
import { isHeavyLoad } from "../services";

const opts = { estimatedTxTimeInSeconds: 120, proofPerTx: 3 };

test("Should set a proper threshold for normal load", () => {
  const numGPUs = 2;
  const processing = 4;
  const heavyLoad = isHeavyLoad(processing, numGPUs, opts);

  expect(heavyLoad).toBe(false);
});

test("Should indicate heavy load if greater than threshold", () => {
  const numGPUs = 2;
  const processing = 5;
  const heavyLoad = isHeavyLoad(processing, numGPUs, opts);

  expect(heavyLoad).toBe(true);
});
