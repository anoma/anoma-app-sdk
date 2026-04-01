import type { IndexerEVMTransaction, IndexerId } from "api";
import { getTokenByResource } from "lib/tokenUtils";
import type {
  AppResource,
  TokenRegistryIndex,
  TransactionReceipt,
  TransactionStatus,
} from "types";

type TransactionReceiptDraft = {
  tx: IndexerEVMTransaction;
  createdResources: AppResource[];
  consumedResources: AppResource[];
};

/** Converts a `TransactionReceiptDraft` into a `TransactionReceipt`. */
function draftToReceipt(
  draft: TransactionReceiptDraft,
  tokenRegistry: TokenRegistryIndex,
  networkMap: Record<string, string>
): TransactionReceipt {
  const { tx, createdResources, consumedResources } = draft;

  const sum = (resources: AppResource[]) =>
    resources.reduce((total, { quantity }) => total + quantity, 0n);

  const createdTotal = sum(createdResources);
  const consumedTotal = sum(consumedResources);

  let status: TransactionStatus;
  let quantity: bigint;
  if (createdResources.length > 0 && consumedResources.length === 0) {
    status = "received";
    quantity = createdTotal;
  } else {
    status = "sent";
    quantity = consumedTotal - createdTotal;
  }

  const token = getTokenByResource(
    tokenRegistry,
    createdResources[0] ?? consumedResources[0],
    networkMap
  );

  return {
    id: tx.id,
    hash: tx.txHash,
    status,
    token,
    quantity,
    timestamp: tx.timestamp * 1000,
  };
}

/** Groups resources by transaction and returns receipts sorted most-recent first. */
export function buildTransactionHistory(
  resources: AppResource[],
  tokenRegistry: TokenRegistryIndex,
  networkMap: Record<string, string>
): TransactionReceipt[] {
  const draftMap = new Map<IndexerId, TransactionReceiptDraft>();

  function getOrCreateDraft(
    tx: IndexerEVMTransaction
  ): TransactionReceiptDraft {
    let entry = draftMap.get(tx.id);
    if (!entry) {
      entry = { tx, createdResources: [], consumedResources: [] };
      draftMap.set(tx.id, entry);
    }
    return entry;
  }

  for (const resource of resources) {
    const { createdIn, consumedIn } = resource;
    if (createdIn) {
      getOrCreateDraft(createdIn).createdResources.push(resource);
    }
    if (consumedIn) {
      getOrCreateDraft(consumedIn).consumedResources.push(resource);
    }
  }

  return Array.from(draftMap.values())
    .sort((a, b) => b.tx.timestamp - a.tx.timestamp)
    .map(entry => draftToReceipt(entry, tokenRegistry, networkMap));
}
