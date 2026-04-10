import bs58 from "bs58";
import { PAY_ADDRESS_BYTE_LENGTH } from "lib/payAddress";
import type { TokenId } from "types";

export type RequestPaymentPayload = {
  payAddress: string;
  token: TokenId;
  amount: string;
};

/** Encodes a request payment payload as a base58 string for use in a URL.
 *  The pay address is stored as raw bytes (not its base58 text) to avoid
 *  double-encoding and keep URLs shorter. */
export const encodeRequestPayment = ({
  payAddress,
  token,
  amount,
}: RequestPaymentPayload): string => {
  const addressBytes = bs58.decode(payAddress);
  const metaBytes = new TextEncoder().encode(`${token}|${amount}`);
  const payload = new Uint8Array(addressBytes.length + metaBytes.length);
  payload.set(addressBytes);
  payload.set(metaBytes, addressBytes.length);
  return bs58.encode(payload);
};

/** Decodes a base58 request payment string back into its payload. */
export const decodeRequestPayment = (
  encoded: string
): RequestPaymentPayload => {
  const bytes = bs58.decode(encoded);
  const addressBytes = bytes.slice(0, PAY_ADDRESS_BYTE_LENGTH);
  const metaBytes = bytes.slice(PAY_ADDRESS_BYTE_LENGTH);
  const payAddress = bs58.encode(addressBytes);
  const [token, amount] = new TextDecoder().decode(metaBytes).split("|");
  return { payAddress, token: token as TokenId, amount };
};
