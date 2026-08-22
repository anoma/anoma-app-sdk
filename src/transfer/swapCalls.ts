import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import type { EvmCall } from "types";
import { encodeFunctionData } from "viem";
import type { SwapCall } from "./types/transfers";

const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

/**
 * Builds the three EVM calls executed by the GenericCallForwarder in the swap's
 * CU2, using Bebop's "Standard" ERC-20 approval (the only approval type allowed
 * for self-execution, i.e. `gasless=false`):
 *
 *  1. `tokenA.approve(approvalTarget, sellAmount)` — let the Bebop settlement
 *     contract pull token A via `transferFrom`.
 *  2. the Bebop swap transaction (`tx.to` / `tx.data`).
 *  3. `tokenB.approve(Permit2, minBuyAmount)` — so the ERC20 forwarder can pull
 *     token B from the forwarder via Permit2 when wrapping it in CU3.
 *
 * `approvalTarget` is the contract that pulls token A (from the Bebop quote);
 * it defaults to the swap `tx.to`.
 */
export function buildSwapCalls({
  tokenA,
  tokenB,
  sellAmount,
  minBuyAmount,
  txData,
  destinationAddress,
  txAmount,
  approvalTarget,
}: SwapCall): EvmCall[] {
  const spender = approvalTarget ?? destinationAddress;
  return [
    {
      to: tokenA,
      value: 0n,
      data: encodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [spender, sellAmount],
      }),
    },
    {
      to: destinationAddress,
      value: BigInt(txAmount || "0"),
      data: txData,
    },
    {
      to: tokenB,
      value: 0n,
      data: encodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [PERMIT2_ADDRESS, minBuyAmount],
      }),
    },
  ];
}
