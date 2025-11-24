export type TokenBalance = {
  tokenSymbol: string;
  amount: bigint;
  network?: string;
};

export const TRANSACTION_STATUS = [
  "sent",
  "sending",
  "waiting-receiver",
  "received",
  "receiving",
  "deposited",
  "depositing",
  "withdraw",
  "withdrawing",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];
