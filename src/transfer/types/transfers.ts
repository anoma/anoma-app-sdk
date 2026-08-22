import { type Address, type Hex } from "viem";

export type UnwrapNativeCall = {
  weth: Address;
  amount: bigint;
  receiver: Address;
};

export type SwapCall = {
  tokenA: Address;
  tokenB: Address;
  sellAmount: bigint;
  minBuyAmount: bigint;
  txData: Hex;
  destinationAddress: Address;
  txAmount?: bigint;
  approvalTarget?: Address;
};
