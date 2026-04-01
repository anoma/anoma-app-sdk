export function calculateLoadThreshold(
  provingGPUs: number,
  opts: {
    estimatedTxTimeInSeconds: number;
    proofPerTx: number;
    averageTimePerProofInSeconds: number;
  }
): number {
  const gpuSeconds = provingGPUs * opts.estimatedTxTimeInSeconds;
  const proofSeconds = opts.proofPerTx * opts.averageTimePerProofInSeconds;

  return gpuSeconds / proofSeconds;
}

export function isHeavyLoad(
  processing: number,
  provingGPUs: number,
  opts: {
    estimatedTxTimeInSeconds: number;
    proofPerTx: number;
    averageTimePerProofInSeconds: number;
  }
): boolean {
  const threshold = calculateLoadThreshold(provingGPUs, opts);

  return processing > threshold;
}
