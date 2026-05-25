import { describe, expect, it } from "vitest";
import { selectUTXOs, type Resource } from "../selectUTXOs";

const make = (quantities: (string | bigint)[]): Resource[] =>
  quantities.map(q => ({ quantity: typeof q === "bigint" ? q : BigInt(q) }));

const sumOf = (rs: Resource[]): bigint =>
  rs.reduce((acc, r) => acc + r.quantity, 0n);

/** Cost of a selection given a target: count if exact, count+1 if remainder. */
const costOf = (rs: Resource[], target: bigint): number => {
  const sum = sumOf(rs);
  if (sum < target) return Infinity;
  return rs.length + (sum === target ? 0 : 1);
};

/**
 * Brute-force the optimal cost across all subsets, and whether an exact
 * selection achieves it. Used to verify the algorithm's tie-break behavior.
 */
const optimalCost = (
  rs: Resource[],
  target: bigint
): { cost: number; exactIsOptimal: boolean } => {
  if (target <= 0n) return { cost: 0, exactIsOptimal: true };
  let best = Infinity;
  let exactIsOptimal = false;
  for (let mask = 1; mask < 1 << rs.length; mask++) {
    let sum = 0n;
    let count = 0;
    for (let i = 0; i < rs.length; i++) {
      if (mask & (1 << i)) {
        sum += rs[i].quantity;
        count++;
      }
    }
    if (sum < target) continue;
    const isExact = sum === target;
    const c = count + (isExact ? 0 : 1);
    if (c < best) {
      best = c;
      exactIsOptimal = isExact;
    } else if (c === best && isExact) {
      exactIsOptimal = true;
    }
  }
  return { cost: best, exactIsOptimal };
};

describe("selectUTXOs — edge cases", () => {
  it("returns [] for target 0", () => {
    expect(selectUTXOs(make([10n, 20n]), 0n)).toEqual([]);
  });

  it("returns [] for negative target", () => {
    expect(selectUTXOs(make([10n]), -1n)).toEqual([]);
  });

  it("returns undefined for empty resource list", () => {
    expect(selectUTXOs([], 100n)).toBeUndefined();
  });

  it("returns undefined when total < target", () => {
    expect(selectUTXOs(make([1n, 2n, 3n]), 100n)).toBeUndefined();
  });
});

describe("selectUTXOs — user-provided examples", () => {
  it("[10,3,3,3] target 9 → [10] (cost 2 beats [3,3,3] cost 3)", () => {
    const rs = make([10n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 9n)!;
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(10n);
    expect(costOf(result, 9n)).toBe(2);
  });

  it("[10,3,3,3] target 6 → [3,3] (exact match wins tie over [10])", () => {
    // [10] remainder → cost 2. [3,3] exact → cost 2. Tied costs.
    // Tie-break rule: exact wins. Algorithm must return [3,3].
    const rs = make([10n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 6n)!;
    expect(sumOf(result)).toBe(6n);
    expect(result).toHaveLength(2);
    expect(costOf(result, 6n)).toBe(2);
  });

  it("[10,3,3,3] target 3 → [3] (cost 1 beats [10] cost 2)", () => {
    const rs = make([10n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 3n)!;
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3n);
    expect(costOf(result, 3n)).toBe(1);
  });
});

describe("selectUTXOs — cost rules", () => {
  it("exact single-resource match has cost 1", () => {
    const rs = make([5n, 10n, 100n, 50n]);
    const result = selectUTXOs(rs, 100n)!;
    expect(result).toHaveLength(1);
    expect(sumOf(result)).toBe(100n);
    expect(costOf(result, 100n)).toBe(1);
  });

  it("exact match wins tie against remainder selection at same cost", () => {
    // [5,4]=9 exact (cost 2) vs [10] remainder (cost 2) — tied.
    // Tie-break: exact wins. Result must sum to exactly 9.
    const rs = make([10n, 5n, 4n, 1n]);
    const result = selectUTXOs(rs, 9n)!;
    expect(sumOf(result)).toBe(9n);
    expect(costOf(result, 9n)).toBe(2);
  });

  it("remainder selection with cost 2 beats exact with cost 3", () => {
    // [10] remainder (cost 2) vs [3,3,3] exact (cost 3). [10] wins.
    const rs = make([10n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 9n)!;
    expect(costOf(result, 9n)).toBe(2);
    expect(result).toHaveLength(1);
  });

  it("exact with cost 2 beats remainder selection with cost 3", () => {
    // No single >= 7. Pairs: 5+4=9 remainder (cost 3), 5+3=8 remainder (cost 3),
    //                        4+3=7 exact (cost 2). Exact wins.
    const rs = make([5n, 4n, 3n, 1n]);
    const result = selectUTXOs(rs, 7n)!;
    expect(sumOf(result)).toBe(7n);
    expect(costOf(result, 7n)).toBe(2);
  });

  it("selects all resources when target equals their total sum (exact)", () => {
    // [3,3,3,3] sum=12, target=12 — all 4 needed, exact selection, cost=4.
    const rs = make([3n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 12n)!;
    expect(sumOf(result)).toBe(12n);
    expect(result).toHaveLength(4);
    expect(costOf(result, 12n)).toBe(4);
  });

  it("selects all resources as remainder when no subset sums exactly to target", () => {
    // [3,3,3,3] sum=12, target=11 — all 4 needed but no exact match exists, cost=5.
    const rs = make([3n, 3n, 3n, 3n]);
    const result = selectUTXOs(rs, 11n)!;
    expect(sumOf(result)).toBeGreaterThan(11n);
    expect(result).toHaveLength(4);
    expect(costOf(result, 11n)).toBe(5);
  });
});

describe("selectUTXOs — return value invariants", () => {
  it("returned resources are references from the input array", () => {
    const rs = make([10n, 20n, 30n]);
    const result = selectUTXOs(rs, 30n)!;
    for (const r of result) expect(rs).toContain(r);
  });

  it("does not mutate the input array", () => {
    const rs = make([5n, 3n, 8n, 1n]);
    const snapshot = rs.map(r => r.quantity);
    selectUTXOs(rs, 9n);
    expect(rs.map(r => r.quantity)).toEqual(snapshot);
  });

  it("preserves resource shape (extra fields pass through)", () => {
    type Tagged = Resource & { id: string };
    const rs: Tagged[] = [
      { quantity: 10n, id: "a" },
      { quantity: 20n, id: "b" },
      { quantity: 30n, id: "c" },
    ];
    const result = selectUTXOs(rs, 25n)!;
    expect(result.every(r => typeof r.id === "string")).toBe(true);
  });

  it("no duplicate references in result", () => {
    const rs = make([1n, 2n, 3n, 4n, 5n]);
    const result = selectUTXOs(rs, 12n)!;
    expect(new Set(result).size).toBe(result.length);
  });

  it("returned set always sums to >= target", () => {
    let seed = 1;
    const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0);
    for (let trial = 0; trial < 30; trial++) {
      const n = (rand() % 15) + 1;
      const rs: Resource[] = [];
      for (let i = 0; i < n; i++)
        rs.push({ quantity: BigInt(rand() % 100) + 1n });
      const total = sumOf(rs);
      const target = BigInt(rand() % Number(total)) + 1n;
      const result = selectUTXOs(rs, target);
      if (result) expect(sumOf(result)).toBeGreaterThanOrEqual(target);
    }
  });
});

describe("selectUTXOs — minimum-cost optimality (vs brute force)", () => {
  it("matches optimal cost and exact-on-tie rule", () => {
    let seed = 42;
    const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0);

    const cases: Array<{ rs: Resource[]; target: bigint }> = [
      // user-provided cases
      ...[3n, 6n, 9n, 12n, 19n].map(target => ({
        rs: make([10n, 3n, 3n, 3n]),
        target,
      })),
      // random cases
      ...Array.from({ length: 50 }, () => {
        const n = (rand() % 10) + 2; // 2 to 11 elements
        const rs: Resource[] = Array.from({ length: n }, () => ({
          quantity: BigInt((rand() % 30) + 1),
        }));
        const total = sumOf(rs);
        const target = BigInt(rand() % Number(total)) + 1n;
        return { rs, target };
      }),
    ];

    for (const { rs, target } of cases) {
      const result = selectUTXOs(rs, target);
      if (!result) continue;

      const { cost: bestCost, exactIsOptimal } = optimalCost(rs, target);
      expect(costOf(result, target)).toBe(bestCost);

      // If an exact selection achieves the optimal cost, the algorithm must
      // return an exact selection (tie-break rule).
      if (exactIsOptimal) expect(sumOf(result)).toBe(target);
    }
  });
});

describe("selectUTXOs — real-world UTXO case (39 resources, 1e18 target)", () => {
  const target = 1000000000000000000n;
  const quantities = [
    "295000000000000000",
    "909100000000",
    "295000000000000000",
    "4038435771704816",
    "37440270038614668",
    "120000000000000000",
    "1000000000000",
    "1000000000000000",
    "10000000000000000",
    "10000000000000000",
    "6990000000000",
    "100000000000000",
    "457777280870764144",
    "1000000000000",
    "100000000000000",
    "10000000000000000",
    "8090000000000",
    "1000000000000",
    "1000000000000000",
    "10000000000000",
    "100000000000000",
    "100000000000000",
    "697000000000000",
    "10000000000000",
    "100000000000000",
    "100000000000000",
    "100000000000000",
    "9900000000000",
    "100000000000000",
    "79890000000000",
    "800000000000",
    "10000000000000",
    "100000000000000",
    "9800000000000",
    "100000000000000",
    "10000000000000",
    "100000000000000",
    "10000000000000",
    "100000000000000",
  ];

  it("returns a covering selection", () => {
    const rs = make(quantities);
    const result = selectUTXOs(rs, target)!;
    expect(sumOf(result)).toBeGreaterThanOrEqual(target);
  });

  it("runs in under 100ms", () => {
    const rs = make(quantities);
    const start = performance.now();
    selectUTXOs(rs, target);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
