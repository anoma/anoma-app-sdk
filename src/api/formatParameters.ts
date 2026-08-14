import type { EncodedResource } from "@anomaorg/arm-bindings";
import type { Parameters } from "types";

// Resources come from `Resource.encode()` (camelCase), backend needs as snake_case.
export function formatParameters(parameters: Parameters) {
  const camelToSnake = (key: string): string =>
    key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`).replace(/^_/, "");

  const formatResource = (resource: EncodedResource) =>
    Object.fromEntries(
      Object.entries(resource).map(([key, value]) => [camelToSnake(key), value])
    );

  const formatArray = <T extends { resource: EncodedResource }>(array: T[]) =>
    array.map(({ resource, ...item }) => ({
      ...item,
      resource: formatResource(resource),
    }));

  return {
    ...parameters,
    consumedResources: formatArray(parameters.consumedResources),
    createdResources: formatArray(parameters.createdResources),
  };
}
