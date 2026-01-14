import { expect, test } from "vitest";
import { isHeavyLoad } from "../services";

test("Should set a proper threshold for normal load", () => {
  const numGPUs = 2;
  const processing = 4;
  const heavyLoad = isHeavyLoad(processing, numGPUs);

  expect(heavyLoad).toBe(false);
});

test("Should indicate heavy load if greater than threshold", () => {
  const numGPUs = 2;
  const processing = 5;
  const heavyLoad = isHeavyLoad(processing, numGPUs);

  expect(heavyLoad).toBe(true);
});
