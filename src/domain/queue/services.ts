import { averageTimePerProofInSeconds } from "lib-constants";

export function calculateLoadThreshold(
  provingGPUs: number,
  opts: { estimatedTxTimeInSeconds: number; proofPerTx: number }
): number {
  const gpuSeconds = provingGPUs * opts.estimatedTxTimeInSeconds;
  const proofSeconds = opts.proofPerTx * averageTimePerProofInSeconds;

  return gpuSeconds / proofSeconds;
}

export function isHeavyLoad(
  processing: number,
  provingGPUs: number,
  opts: { estimatedTxTimeInSeconds: number; proofPerTx: number }
): boolean {
  const threshold = calculateLoadThreshold(provingGPUs, opts);

  return processing > threshold;
}
