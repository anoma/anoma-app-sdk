export type ResourceQuantity = { quantity: bigint };

/**
 * Select resources to cover `target` with the fewest UTXOs, preferring
 * selections that need no change output.
 *
 * Cost model:
 *   - Exact selection (sum === target):           cost = number of UTXOs selected.
 *   - Remainder selection (sum > target):         cost = number of UTXOs selected + 1,
 *     because a change output will be created.
 *
 * On ties, an exact selection is preferred over a remainder selection,
 * leaving the user with fewer UTXOs after the transfer.
 *
 * Returns undefined if even all resources combined fall short of target.
 *
 * Strategy:
 *   1. Find minCoverCount: the smallest number of largest UTXOs whose sum >= target.
 *      A remainder selection using those UTXOs has cost minCoverCount + 1 (unless
 *      they happen to sum exactly to target, in which case the exact-search loop
 *      below finds that at cost minCoverCount).
 *   2. Search for an exact selection of size 1, 2, ..., minCoverCount + 1:
 *      - size <= minCoverCount: cost = size <= minCoverCount < minCoverCount + 1 → beats excess.
 *      - size = minCoverCount + 1: cost ties the remainder selection; exact wins the tie.
 *      - size >= minCoverCount + 2: cost > minCoverCount + 1 → never wins, skip.
 *      The first exact match found is the smallest-size exact selection.
 *   3. If no competitive exact selection exists, return the minCoverCount largest UTXOs.
 *
 * Complexity:
 *   - Sort: O(n log n).
 *   - minCoverCount scan: O(n).
 *   - Exact search: O(n) for size=1, O(n^2) for size=2, etc. Bounded by
 *     minCoverCount + 1, which is typically small in UTXO contexts (1–5).
 *     Pruning keeps the real cost far below the worst case.
 */
export function selectUTXOs<R extends ResourceQuantity>(
  resources: R[],
  target: bigint
): R[] | undefined {
  if (target <= 0n) return [];
  if (resources.length === 0) return undefined;

  // Sort descending — used for the minCoverCount scan and exact-search base order
  const sortedResources = [...resources].sort((a, b) =>
    a.quantity < b.quantity ? 1
    : a.quantity > b.quantity ? -1
    : 0
  );
  const n = sortedResources.length;

  // ---- Find minCoverCount: fewest largest UTXOs whose sum >= target ----
  let coverSum = 0n;
  let minCoverCount = 0;
  for (let i = 0; i < n; i++) {
    coverSum += sortedResources[i].quantity;
    minCoverCount++;
    if (coverSum >= target) break;
  }
  if (coverSum < target) return undefined; // all UTXOs combined fall short

  // ---- Exact-search for selection sizes 1 .. minCoverCount + 1 ----
  // Iterating size upward guarantees the first hit is the smallest exact selection.
  const maxSelectionSize = Math.min(minCoverCount + 1, n);
  for (
    let selectionSize = 1;
    selectionSize <= maxSelectionSize;
    selectionSize++
  ) {
    const exact = findExactSubset(sortedResources, target, selectionSize);
    if (exact) return exact;
  }

  // No exact selection can beat the remainder selection — return the largest UTXOs.
  return sortedResources.slice(0, minCoverCount);
}

/**
 * Find any subset of exactly `size` elements from `sortedResources` (sorted descending)
 * whose quantities sum to exactly `target`. Returns undefined if none exists.
 *
 * Implementation: depth-first search with two pruning rules:
 *   - Prune A (can't reach): if the sum of all remaining candidates is still
 *     less than the amount still needed, abandon this branch.
 *   - Prune B (too large): if the current element alone exceeds the amount
 *     still needed, skip it. Elements later in the sorted order are smaller,
 *     so we keep scanning for a fitting one.
 *
 * For small sizes (1, 2, 3) this is very fast in practice. The caller bounds
 * size by minCoverCount + 1, which is typically small in UTXO contexts.
 */
function findExactSubset<R extends ResourceQuantity>(
  sortedResources: R[],
  target: bigint,
  size: number
): R[] | undefined {
  const n = sortedResources.length;
  if (size > n) return undefined;

  // suffixSum[i] = sum of sortedResources[i..n-1]; used for Prune A.
  // Because sortedResources is descending, suffixSum[i] is the maximum we can still add
  // starting from index i.
  const suffixSum = new Array<bigint>(n + 1);
  suffixSum[n] = 0n;
  for (let i = n - 1; i >= 0; i--)
    suffixSum[i] = suffixSum[i + 1] + sortedResources[i].quantity;

  const picked: R[] = [];

  function dfs(start: number, slotsLeft: number, amountLeft: bigint): boolean {
    if (slotsLeft === 0) return amountLeft === 0n;

    const lastIndex = n - slotsLeft; // last index we can pick — needs slotsLeft elements from here to end

    for (let i = start; i <= lastIndex; i++) {
      const { quantity } = sortedResources[i];

      // Prune A: everything from here onward still can't reach amountLeft
      if (suffixSum[i] < amountLeft) return false;

      // Prune B: this element alone already exceeds what's needed
      if (quantity > amountLeft) continue;

      picked.push(sortedResources[i]);
      if (dfs(i + 1, slotsLeft - 1, amountLeft - quantity)) return true;
      picked.pop();
    }

    return false;
  }

  return dfs(0, size, target) ? [...picked] : undefined;
}
