import type { IndexerEVMTransaction, IndexerResource, IndexerTag } from "api";
import { fromHex, normalizeHex } from "lib/utils";
import type { AppResource, Parameters, UserKeyring } from "types";
import { type Address, type Hex } from "viem";
import { NullifierKey, Resource, ResourceWithLabel } from "wasm";
import type { TransferResources, TransferResourceWithAmount } from "./types";

type TransactionLookup = {
  byNullifier: Map<string, IndexerEVMTransaction>;
  byTxHash: Map<Address, IndexerEVMTransaction>;
};

type ResourceWithDetails = {
  resource: Resource;
  forwarder: Address;
  erc20TokenAddress: Address;
  transactionHash: Address;
};

/** Creates lookup maps for transactions indexed by nullifier hash and transaction hash. */
export function buildTransactionLookup(tags: IndexerTag[]): TransactionLookup {
  const lookup: TransactionLookup = {
    byNullifier: new Map(),
    byTxHash: new Map(),
  };
  for (const tag of tags) {
    lookup.byNullifier.set(
      normalizeHex(tag.tagHash),
      tag.transaction.evmTransaction
    );
    lookup.byTxHash.set(
      tag.transaction.evmTransaction.txHash,
      tag.transaction.evmTransaction
    );
  }
  return lookup;
}

function deserializeResourcePayload(
  blobHex: Hex,
  encryptionPrivateKey: Uint8Array
): ResourceWithLabel {
  const payload = fromHex(blobHex);
  return ResourceWithLabel.fromEncrypted(payload, encryptionPrivateKey);
}

const tryToDeserializeResourcePayload = (
  keyring: UserKeyring,
  indexerResource: IndexerResource
) => {
  try {
    return deserializeResourcePayload(
      indexerResource.resource_payload.blob,
      keyring.encryptionKeyPair.privateKey
    );
  } catch {
    return false;
  }
};

/** Decrypts and deserializes indexer resource payloads using the user's encryption key. */
export const parseIndexerResourceResponse = async (
  keyring: UserKeyring,
  resourceResponseCollection: IndexerResource[]
): Promise<ResourceWithDetails[]> => {
  return resourceResponseCollection.flatMap(item => {
    const payload = tryToDeserializeResourcePayload(keyring, item);
    if (!payload) {
      return [];
    }
    return {
      resource: payload.resource,
      forwarder: payload.forwarder as Address,
      erc20TokenAddress: payload.erc20TokenAddress as Address,
      transactionHash: item.transaction_hash,
    };
  });
};

/** Filters out ephemeral resources, returning only persistent ones. */
export const pickNonEphemeralResources = (
  resources: ResourceWithDetails[]
): ResourceWithDetails[] => {
  return resources.filter(item => !item.resource.encode().is_ephemeral);
};

/** Computes nullifiers and consumption status for each resource, returning enriched AppResource entries. */
export const openResourceMetadata = async (
  keyring: UserKeyring,
  resources: ResourceWithDetails[],
  transactionLookup: TransactionLookup,
  onlyAvailableResources = true
): Promise<AppResource[]> => {
  const updatedResources: AppResource[] = [];
  const nullifierKey = new NullifierKey(keyring.nullifierKeyPair.nk);

  // Step 1: Compute optimistic balance from all decrypted resources quantities
  for (const deserializedResource of resources) {
    const { resource, erc20TokenAddress, forwarder, transactionHash } =
      deserializedResource;

    const resourceProps = resource.encode();

    // Step 2: Compute nullifier for each resource
    let nullifierHex: string | undefined;
    try {
      nullifierHex = normalizeHex(resource.nullifier(nullifierKey).toHex());
    } catch {
      console.warn("Couldn't nullify resource " + resourceProps.nonce);
    }

    if (nullifierHex) {
      // Step 3: Compare computed nullifier with indexer-provided nullifiers
      // Update the actual consumed status based on nullifier comparison
      const createdTransaction =
        transactionLookup.byTxHash.get(transactionHash);
      const consumedTransaction =
        transactionLookup.byNullifier.get(nullifierHex);
      const isConsumed = !!consumedTransaction;
      if (!onlyAvailableResources || !isConsumed) {
        updatedResources.push({
          ...resourceProps,
          isConsumed,
          erc20TokenAddress,
          forwarder,
          createdTransaction,
          consumedTransaction,
        });
      }
    }
  }

  return updatedResources;
};

function omitSelectedFromRemaining(
  selected: TransferResourceWithAmount[],
  remaining: AppResource[]
): TransferResources {
  return {
    selected,
    remaining: remaining.filter(
      r => !selected.some(s => s.resource.rand_seed === r.rand_seed)
    ),
  };
}

/**
 * Given a collection of Resources, return an array of the fewest resources
 * whose quantities sum to the exact target quantity
 */
function findMinResourceQuantitySum(
  resources: AppResource[],
  targetQuantity: bigint
): AppResource[] | undefined {
  if (resources.length === 0) return undefined;

  let min: AppResource[] | undefined;
  for (let i = 0; i < resources.length; i++) {
    // If a quantity equals the targetQuantity, it is the shortest set of length 1
    if (resources[i].quantity === targetQuantity) return [resources[i]];

    // Recursively call on subset with sum adjusted for removed element
    const next = findMinResourceQuantitySum(
      resources.slice(i + 1),
      targetQuantity - resources[i].quantity
    );

    if (next) {
      if (min === undefined || next.length < min.length) {
        min = [resources[i], ...next];
      }
    }
  }
  return min;
}

/**
 * Return first resource which can fulfill a transfer either with exact
 * quantity or by splitting
 */
function findMinTransferResource(
  resources: AppResource[],
  targetAmount: bigint
): [TransferResourceWithAmount, AppResource[]] | undefined {
  // Sort by ascending quantity to find first resource which might fulfill targetQuantity
  const sortedResources = [...resources].sort((a, b) =>
    Number(a.quantity - b.quantity)
  );
  // return first matching resource which can provide target amount
  const matchIndex = sortedResources.findIndex(
    ({ quantity }) => quantity >= targetAmount
  );

  if (matchIndex > -1) {
    const resource = sortedResources.splice(matchIndex, 1)[0];
    return [
      {
        resource,
        targetAmount,
      },
      sortedResources,
    ];
  }
}

/**
 * If we know that there is not an exact quantity match, or subset of resources
 * whose quantities sum to an exact target quantity, iterate through resources
 * until we have enough summed quantities plus a split to fulfill transfer
 */

function findTransferResourcesWithSplit(
  resources: AppResource[],
  targetQuantity: bigint
): [TransferResourceWithAmount[], AppResource[]] {
  const selected: TransferResourceWithAmount[] = [];
  const remaining: AppResource[] = [];

  // Sort by descending quantity to find *fewest* number of resources for transfer
  const sortedResources = resources.sort((a, b) =>
    Number(b.quantity - a.quantity)
  );
  let missingQuantity = targetQuantity;
  for (let i = 0; i < sortedResources.length; i++) {
    const resource = sortedResources[i];
    const quantity =
      missingQuantity < resource.quantity ? missingQuantity : resource.quantity;
    selected.push({ resource, targetAmount: quantity });
    missingQuantity -= quantity;
    if (missingQuantity === 0n) {
      // This is the last item we want, and is a split, so break
      remaining.push(...sortedResources.slice(i + 1));
      break;
    }
  }

  return [selected, remaining];
}

/**
 * Determine what resources are needed to fulfill a transfer, either by resources
 * to sum, a resource to split, or both
 */
export const selectTransferResources = (
  resources: AppResource[],
  targetAmount: bigint
): TransferResources => {
  if (resources.length === 0) {
    throw new Error("No resources provided!");
  }
  if (targetAmount === 0n) {
    throw new Error("Must specify a quantity greater than 0");
  }

  // Check if a single resource can provide target amount
  const [match, unmatchedResources = resources] =
    findMinTransferResource(resources, targetAmount) ?? [];

  if (match) {
    // Either a resource with matched quantity or a split resource
    return {
      selected: [match],
      remaining: unmatchedResources,
    };
  }

  // Check if summing can provide target quantity
  const summedResources = findMinResourceQuantitySum(resources, targetAmount);

  if (summedResources) {
    return omitSelectedFromRemaining(
      summedResources.map(sr => ({
        resource: sr,
        targetAmount: sr.quantity,
      })),
      resources
    );
  }

  const [selected, remaining] = findTransferResourcesWithSplit(
    resources,
    targetAmount
  );
  return {
    selected,
    remaining,
  };
};

/**
 * Given multiple Parameters objects. merge into one in order received
 */
export const mergeParameters = (parameters: Parameters[]): Parameters =>
  parameters.reduce(
    (mergedParameters, parameters) => ({
      consumed_resources: [
        ...mergedParameters.consumed_resources,
        ...parameters.consumed_resources,
      ],
      created_resources: [
        ...mergedParameters.created_resources,
        ...parameters.created_resources,
      ],
    }),
    { consumed_resources: [], created_resources: [] }
  );
