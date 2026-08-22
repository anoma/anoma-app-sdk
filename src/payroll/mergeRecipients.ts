import type { PayrollRecipient } from "./types";

/**
 * Merges `incoming` recipients into `current` by `id`: matching ids update the
 * existing entry in place (preserving order); new ids are appended; current
 * recipients without an incoming match are kept.
 */
export const mergeRecipientsByUuid = (
  current: PayrollRecipient[],
  incoming: PayrollRecipient[]
): PayrollRecipient[] => {
  const byId = new Map(current.map(r => [r.id, r]));
  for (const r of incoming) {
    const existing = byId.get(r.id);
    byId.set(r.id, existing ? { ...existing, ...r } : r);
  }
  return [...byId.values()].filter(r => r.name || r.address); // filter out empty rows
};
