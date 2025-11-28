import {
  Ciphertext,
  NullifierKey,
  Resource,
  SecretKey,
  type EncodedResource,
} from "@anoma/lib";
import type { EnvioClient, IndexerResource } from "api";
import { SIMPLE_TRANSFER_ID } from "app-constants";
import { fromHex, normalizeHex } from "lib/utils";
import type { ResourcesWithBalance, ResourceWithMetadata } from "types";

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
): Resource {
  const bytes = fromHex(blobHex);
  const userSecretKey = new SecretKey(encryptionPrivateKey);
  const ciphertext = Ciphertext.fromBytes(bytes);
  const decryptedBytes = ciphertext.decrypt(userSecretKey);
  return Resource.fromBytes(decryptedBytes);
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
            resource: deserializeResourcePayload(
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
    .filter(item => !item.resource.encode().is_ephemeral);
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
    const { resource } = resourceWithMetadata;
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
 * Simple method that accepts resources and a quantity,
 * finds the first resource who's quantity is >= to the
 * requested quantity.Returns tuple of matched resource
 * and remainder. If remainder is 0, there is no need
 * to split!
 */
export const getSplitResource = (
  resources: EncodedResource[],
  quantity: bigint
): [EncodedResource | undefined, bigint] => {
  const sortedResources = resources.sort((a, b) =>
    Number(a.quantity - b.quantity)
  );
  const splitResource = sortedResources.find(
    resource => resource.quantity >= quantity
  );
  return [
    splitResource,
    splitResource ? splitResource.quantity - quantity : 0n,
  ];
};
