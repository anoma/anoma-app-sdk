import { toBase64Url } from "lib/base64url";
import { generateRandomBytes } from "lib/utils";

export const claimRoute = `${location.origin}/claim/`;

export const generateClaimLink = (): string => {
  const randomBytes = generateRandomBytes();
  const seed = toBase64Url(randomBytes);
  return `${claimRoute}${seed}`;
};
