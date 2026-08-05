import type { EvmCall } from "types";
import { encodeFunctionData } from "viem";
import type { UnwrapNativeCall } from "./types/transfers";

const WETH_WITHDRAW_ABI = [
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;

/**
 * Builds the two EVM calls executed by the GenericCallForwarder to turn wrapped
 * native tokens it holds into native tokens sent to `receiver`:
 *
 *  1. `weth.withdraw(amount)` — burns the forwarder's WETH and pays it back the
 *     same amount in native tokens (the forwarder emits `NativeTokenReceived`).
 *  2. a plain value transfer of `amount` to `receiver`, with empty calldata.
 *
 * The forwarder must already hold `amount` WETH (e.g. unwrapped into it by the
 * ERC20Forwarder in the previous compliance unit).
 */
export function buildUnwrapNativeCalls({
  weth,
  amount,
  receiver,
}: UnwrapNativeCall): EvmCall[] {
  return [
    {
      to: weth,
      value: 0n,
      data: encodeFunctionData({
        abi: WETH_WITHDRAW_ABI,
        functionName: "withdraw",
        args: [amount],
      }),
    },
    {
      to: receiver,
      value: amount,
      data: "0x",
    },
  ];
}
