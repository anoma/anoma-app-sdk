import transferSchema from "schemas/transfer.schema";
import type { TokenBalance, TokenRegistry } from "types";
import { parseUnits } from "viem";

export const getSenderValidationMessages = (
  token?: TokenRegistry,
  transferAmount?: string,
  availableBalance?: TokenBalance
) => {
  if (!token) return "Select a token to deposit";
  if (!transferAmount) return "Enter deposit amount";

  const result = transferSchema.safeParse({
    minDenomAmountToTransfer: parseUnits(transferAmount, token.decimals),
    minDenomAccountBalance: availableBalance?.amount,
  });

  if (!result.success) {
    return result.error.issues[0].message;
  }

  return null;
};
