import type { EnvioClient, IndexerResource } from "api";
import { SIMPLE_TRANSFER_ID } from "app-constants";
import { fromHex, normalizeHex } from "lib/utils";
import type {
  EncodedResourceWithStatus,
  Parameters,
  ResourceBalance,
  ResourcesWithBalance,
  UserKeyring,
} from "types";
import { type Address, type Hex } from "viem";
import { NullifierKey, ResourceWithLabel, type EncodedResource } from "wasm";

/** Convert an Envio nullifier list into a normalized hex set. */
export async function buildNullifierSet(
  envio: EnvioClient,
  logicRefHex: string = SIMPLE_TRANSFER_ID
): Promise<Set<string>> {
  const hex = logicRefHex.startsWith("0x") ? logicRefHex : `0x${logicRefHex}`;
  const rows = await envio.nullifiers(hex);
  const set = new Set<string>();
  for (const r of rows) set.add(normalizeHex(r.nullifier));
  return set;
}

export function deserializeResourcePayload(
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

export const parseIndexerResourceResponse = async (
  keyring: UserKeyring,
  resourceResponseCollection: IndexerResource[]
): Promise<ResourceWithLabel[]> => {
  return resourceResponseCollection.flatMap(item => {
    const payload = tryToDeserializeResourcePayload(keyring, item);
    return payload ? payload : [];
  });
};

export const pickNonEphemeralResources = (
  resources: ResourceWithLabel[]
): ResourceWithLabel[] => {
  return resources.filter(item => !item.resource.encode().is_ephemeral);
};

export const openResourceMetadata = async (
  keyring: UserKeyring,
  resources: ResourceWithLabel[],
  nullifierSet: Set<string>,
  onlyAvailableResources = true
): Promise<EncodedResourceWithStatus[]> => {
  const updatedResources: EncodedResourceWithStatus[] = [];
  const nullifierKey = new NullifierKey(keyring.nullifierKeyPair.nk);

  // Step 1: Compute optimistic balance from all decrypted resources quantities
  for (const resourceWithLabel of resources) {
    const { resource, erc20TokenAddress, forwarder } = resourceWithLabel;

    const resourceProps = resource.encode();

    // Step 2: Compute nullifier for each resource
    let nullifierHex: string | undefined;
    try {
      nullifierHex = normalizeHex(resource.nullifier(nullifierKey).toHex());
    } catch {
      console.warn("Couldn't nullify resource " + resourceProps.nonce);
    }

    if (nullifierHex) {
      const actualIsConsumed = nullifierSet.has(nullifierHex);

      // Step 3: Compare computed nullifier with indexer-provided nullifiers
      // Update the actual consumed status based on nullifier comparison
      if (!onlyAvailableResources || !actualIsConsumed) {
        updatedResources.push({
          ...resourceProps,
          isConsumed: actualIsConsumed,
          erc20TokenAddress: erc20TokenAddress as Address,
          forwarder: forwarder as Address,
        });
      }
    }
  }

  return updatedResources;
};

export async function calculateResourceBalance(
  resources: EncodedResourceWithStatus[]
): Promise<ResourcesWithBalance> {
  // Create a balances map to sum resource quantities
  const balancesMap = new Map<string, ResourceBalance>();

  for (const resource of resources) {
    const {
      quantity,
      label_ref: label,
      erc20TokenAddress,
      forwarder,
    } = resource;
    const key = `${label}|${erc20TokenAddress}|${forwarder}`;

    const balance = balancesMap.get(key);
    if (balance) {
      balance.quantity += quantity;
    } else {
      balancesMap.set(key, {
        label,
        erc20TokenAddress,
        forwarder,
        quantity,
      });
    }
  }

  return {
    balances: [...balancesMap.values()],
    resources,
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
