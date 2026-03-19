import bs58 from "bs58";
import { generateRandomBytes } from "lib/utils";

export const claimRoute = `${location.origin}/claim/`;

/** Generates a claim link with a random seed encoded in base58. */
export const generateClaimLink = (): string => {
  const randomBytes = generateRandomBytes();
  const seed = bs58.encode(randomBytes);
  return `${claimRoute}${seed}`;
};
