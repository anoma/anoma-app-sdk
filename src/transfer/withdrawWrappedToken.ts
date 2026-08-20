import type { EvmCall, TokenRegistry } from "types";
import { encodeFunctionData } from "viem";
import type { UnwrapNativeCall } from "./types/transfers";

/**
 * Per-network wrapped-native token, keyed by `TokenRegistry.network`.
 *
 * Keyed by network rather than by symbol alone because the same symbol is not
 * a wrapper everywhere: `WETH` on `bsc` and `monad` is a bridged ERC-20 with no
 * `withdraw()` (their natives are BNB and MON), so unwrapping there would
 * revert on-chain. Only networks whose listed token is the canonical wrapper
 * belong here.
 *
 * Adding a network is one line.
 */
const WRAPPED_NATIVE_BY_NETWORK: Record<
  string,
  { wrappedSymbol: string; nativeSymbol: string }
> = {
  ethereum: { wrappedSymbol: "WETH", nativeSymbol: "ETH" },
  arbitrum: { wrappedSymbol: "WETH", nativeSymbol: "ETH" },
  base: { wrappedSymbol: "WETH", nativeSymbol: "ETH" },
  monad: { wrappedSymbol: "WMON", nativeSymbol: "MON" },
};

/**
 * The native symbol a token can be unwrapped into (e.g. `"ETH"` for WETH on
 * Ethereum), or `undefined` when the token is not its network's wrapped native.
 *
 * Use this to gate the "receive as native" option: a defined result means
 * {@link buildUnwrapNativeCalls} will succeed against `token.address`.
 */
export function nativeSymbolFor(token?: TokenRegistry): string | undefined {
  const entry = token && WRAPPED_NATIVE_BY_NETWORK[token.network];
  if (!entry) return undefined;
  return entry.wrappedSymbol.toLowerCase() === token.symbol.toLowerCase() ?
      entry.nativeSymbol
    : undefined;
}

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
