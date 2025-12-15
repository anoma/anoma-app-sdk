import type { EnvioClient, IndexerResource } from "api";
import { SIMPLE_TRANSFER_ID } from "app-constants";
import { fromHex, normalizeHex } from "lib/utils";
import type {
  Parameters,
  ResourcesWithBalance,
  ResourceWithMetadata,
} from "types";
import { NullifierKey, ResourceWithLabel, type EncodedResource } from "wasm";

/** Convert an Envio nullifier list into a normalized hex set. */
async function buildNullifierSet(
  envio: EnvioClient,
  logicRefHex: string
): Promise<Set<string>> {
  const rows = await envio.nullifiers(logicRefHex);
  const set = new Set<string>();
  for (const r of rows) set.add(normalizeHex(r.nullifier));
  return set;
}

export function deserializeResourcePayload(
  blobHex: string,
  encryptionPrivateKey: Uint8Array
): ResourceWithLabel {
  const payload = fromHex(blobHex);
  return ResourceWithLabel.fromEncrypted(payload, encryptionPrivateKey);
}

export const parseIndexerResourceResponse = (
  resourceResponseCollection: IndexerResource[],
  encryptionPrivateKey: Uint8Array
): ResourceWithMetadata[] => {
  return resourceResponseCollection
    .flatMap(item => {
      try {
        return [
          {
            resourceWithLabel: deserializeResourcePayload(
              item.resource_payload.blob,
              encryptionPrivateKey
            ),
            tag: item.tag || "",
            isConsumed: item.is_consumed || false,
          },
        ];
      } catch {
        console.warn("Couldn't decrypt resource " + item.tag);
        return [];
      }
    })
    .filter(item => !item.resourceWithLabel.resource.encode().is_ephemeral);
};

export async function calculateResourceBalanceWithNullifiers(
  resources: ResourceWithMetadata[],
  nullifierKey: NullifierKey,
  envio: EnvioClient
): Promise<ResourcesWithBalance> {
  // Use the specific logic_ref for this application, which is SIMPLE_TRANSFER_ID
  // TODO make this more generic
  const logicRefHex = `0x${SIMPLE_TRANSFER_ID}`;
  const indexerNullifiers = await buildNullifierSet(envio, logicRefHex);

  // Create updated resources array with corrected isConsumed status
  const updatedResources: ResourceWithMetadata[] = [];

  // Create a balances map to sum resource quantities
  const balancesMap: Record<string, bigint> = {};

  // Step 1: Compute optimistic balance from all decrypted resources quantities
  for (const resourceWithMetadata of resources) {
    const {
      resourceWithLabel: { resource },
    } = resourceWithMetadata;
    const { quantity, label_ref, nonce } = resource.encode();

    // Step 2: Compute nullifier for each resource
    try {
      const nullifierHex = normalizeHex(
        resource.nullifier(nullifierKey).toHex()
      );

      // Step 3: Compare computed nullifier with indexer-provided nullifiers
      // Update the actual consumed status based on nullifier comparison
      const actualIsConsumed = indexerNullifiers.has(nullifierHex);

      // Step 4: Add if not consumed
      if (!actualIsConsumed) {
        balancesMap[label_ref] = (balancesMap[label_ref] ?? 0n) + quantity;
        updatedResources.push({
          ...resourceWithMetadata,
          isConsumed: actualIsConsumed,
        });
      }
    } catch {
      console.warn("Couldn't nullify resource " + nonce);
    }
  }

  // Format balances from total quantities
  const balances = Object.entries(balancesMap)
    .map(([label, quantity]) => ({ label, quantity }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    balances,
    resources: updatedResources,
  };
}

/**
 * Given a collection of Resources, return an array of the fewest resources
 * whose quantities sum to the exact target quantity
 */
export function findMinResourceQuantitySum(
  resources: EncodedResource[],
  targetQuantity: bigint
): EncodedResource[] | undefined {
  if (resources.length === 0) return undefined;

  let min: EncodedResource[] | undefined;
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
 * A collection of transfer resources with the amount to transfer.
 * NOTE: Amount may be less than resource quantity, in this case,
 * we have a split:
 */
export type TransferResourceWithAmount = [EncodedResource, bigint];
export type TransferResources = TransferResourceWithAmount[];

/**
 * Return first resource which can fulfill a transfer either with exact
 * quantity or by splitting
 */
export function findMinTransferResource(
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResourceWithAmount | undefined {
  // Sort by ascending quantity to find first resource which might fulfill targetQuantity
  const sortedResources = resources.sort((a, b) =>
    Number(a.quantity - b.quantity)
  );

  // return first matching resource which can provide target amount
  const match = sortedResources.find(
    ({ quantity }) => quantity >= targetQuantity
  );

  if (match) {
    return [match, targetQuantity];
  }
}
/**
 * If we know that there is not an exact quantity match, or subset of resources
 * whose quantities sum to an exact target quantity, iterate through resources
 * until we have enough summed quantities plus a split to fulfill transfer
 */
export function findTransferResourcesWithSplit(
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResources {
  const transferResources: TransferResources = [];

  // Sort by descending quantity to find *fewest* number of resources for transfer
  const sortedResources = resources.sort((a, b) =>
    Number(b.quantity - a.quantity)
  );
  let sum = 0n;
  for (let i = 0; i < sortedResources.length; i++) {
    const resource = resources[i];
    sum += resource.quantity;
    transferResources.push([resource, targetQuantity]);

    if (sum > targetQuantity) {
      // This is the last item we want, and is a split, so break
      break;
    }
  }

  return transferResources;
}

/**
 * Determine what resources are needed to fulfill a transfer, either by resources
 * to sum, a resource to split, or both
 */
export const selectTransferResources = (
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResources => {
  if (resources.length === 0) {
    throw new Error("No resources provided!");
  }
  if (targetQuantity === 0n) {
    throw new Error("Must specify a quantity greater than 0");
  }

  // Check if a single resource can provide target amount
  const match = findMinTransferResource(resources, targetQuantity);

  if (match) {
    // Either a resource with matched quantity or a split resource
    return [match];
  }

  // Check if summing can provide target quantity
  const summedResources =
    findMinResourceQuantitySum(resources, targetQuantity) || [];

  if (summedResources.length > 0) {
    // Resources whose quantities sum to exact targetQuantity
    return summedResources.map(summedResource => [
      summedResource,
      summedResource.quantity,
    ]);
  }

  // Resources to sum plus a split resource
  return findTransferResourcesWithSplit(resources, targetQuantity);
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
