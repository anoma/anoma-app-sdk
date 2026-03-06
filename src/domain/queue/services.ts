import {
  averageTimePerProofInSeconds,
  estimatedTxTimeInSeconds,
  proofPerTx,
} from "lib-constants";

export function calculateLoadThreshold(provingGPUs: number): number {
  const gpuSeconds = provingGPUs * estimatedTxTimeInSeconds;
  const proofSeconds = proofPerTx * averageTimePerProofInSeconds;

  return gpuSeconds / proofSeconds;
}

export function isHeavyLoad(processing: number, provingGPUs: number): boolean {
  const threshold = calculateLoadThreshold(provingGPUs);

  return processing > threshold;
}
