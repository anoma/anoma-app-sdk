import { SWAP_EXPIRATION_OFFSET_SECONDS } from "lib-constants";
import { getUserPublicKeysFromKeyring } from "lib/keyUtils";
import { toBase64 } from "lib/utils";
import type {
  AppResource,
  ConsumeIntent,
  CreateIntent,
  EvmCall,
  Permit2Data,
  ResolvedParameters,
  SupportedChainConfig,
  TokenRegistry,
  UserKeyring,
} from "types";
import { NullifierKey, randomBytes } from "wasm";
import { createGenericCallResource } from "../genericCalls";
import { ParametersDraftResolver } from "./ParametersDraftResolver";
import type { TransferBuilder } from "./TransferBuilder";

export type SwapResolveInput = {
  /** The user's resources for the sell token. */
  senderResources: AppResource[];
  /** Sell token (owned by the user). */
  tokenA: TokenRegistry;
  /** Buy token (must be a supported, wrappable token). */
  tokenB: TokenRegistry;
  /** Amount of token A to swap, in its smallest unit (excludes fee). */
  swapAmount: bigint;
  /** Guaranteed minimum amount of token B from the Bebop quote. */
  minBuyAmount: bigint;
  /** The four EVM calls executed by the GenericCallForwarder (CU2). */
  calls: EvmCall[];
  /** Heliax fee in token A, in its smallest unit. */
  fee: bigint;
};

/**
 * Builds a dummy Permit2 payload for the token-B wrap in CU3. The funds are
 * pulled from the GenericCallForwarder, which implements ERC-1271 and always
 * returns the magic value, so the signature is never verified on-chain. The
 * backend's structural checks still require a 65-byte signature, a non-empty
 * nonce, and an unexpired deadline.
 */
function buildForwarderWrapPermit2(expirationOffset: number): Permit2Data {
  const signature = new Uint8Array(65);
  signature[64] = 27; // r = 0, s = 0, v = 27 — accepted via ERC-1271.
  return {
    deadline: Math.floor(Date.now() / 1000) + expirationOffset,
    nonce: toBase64(randomBytes()),
    signature: toBase64(signature),
  };
}

/**
 * Resolves the full set of consumed/created resource intents for a swap.
 *
 * The token-A leg (unwrap into the forwarder + Heliax fee + change) reuses the
 * standard {@link ParametersDraftResolver}; the generic-call (CU2) and
 * token-B wrap (CU3) legs are appended as additional balanced pairs. The
 * resulting `ResolvedParameters` is fed to a `PayloadBuilder` to authorize and
 * serialize into the backend `Parameters`.
 */
export class SwapResolver {
  private readonly transferBuilder: TransferBuilder;
  private readonly senderKeyring: UserKeyring;
  private readonly chain: SupportedChainConfig;

  constructor(
    transferBuilder: TransferBuilder,
    senderKeyring: UserKeyring,
    chain: SupportedChainConfig
  ) {
    this.transferBuilder = transferBuilder;
    this.senderKeyring = senderKeyring;
    this.chain = chain;
  }

  /** Builds the intents for a given fee. Call repeatedly while converging on the fee. */
  resolve(
    input: SwapResolveInput,
    expirationOffset = SWAP_EXPIRATION_OFFSET_SECONDS
  ): ResolvedParameters {
    const senderPublicKeys = getUserPublicKeysFromKeyring(this.senderKeyring);
    const nk = this.senderKeyring.nullifierKeyPair.nk;

    // CU1 + fee + change: unwrap token A into the forwarder, pay the Heliax fee,
    // and return any remainder to the user. Resource selection, fee/change
    // receivers and padding are all handled by the standard resolver.
    const tokenAResolver = new ParametersDraftResolver(
      this.transferBuilder,
      senderPublicKeys,
      nk,
      this.chain
    );
    tokenAResolver.addReceiver({
      type: "EvmAddress",
      address: this.chain.genericCallForwarderAddress,
      quantity: input.swapAmount,
      token: input.tokenA,
    });
    if (input.fee > 0n) {
      tokenAResolver.addReceiver({
        type: "AnomaAddress",
        userPublicKeys: this.chain.feePublicKeys,
        quantity: input.fee,
        token: input.tokenA,
      });
    }
    const tokenALeg = tokenAResolver.build(input.senderResources);

    // CU2: the generic-call resource carrying the swap calls, balanced by a
    // padding resource.
    const genericCallResource = createGenericCallResource({
      logicVerifyingKey: this.chain.genericCallLogicVerifyingKey,
      forwarderAddress: this.chain.genericCallForwarderAddress,
      calls: input.calls,
    });
    const genericCallConsume: ConsumeIntent = {
      type: "GenericCall",
      forwarderAddress: this.chain.genericCallForwarderAddress,
      calls: input.calls,
      resource: genericCallResource,
      nullifierKey: NullifierKey.default(),
    };
    const genericCallPadding: CreateIntent = {
      resource: this.transferBuilder.client.createPaddingResource({
        nullifierKey: NullifierKey.default(),
        resource: genericCallResource,
      }),
      receiver: undefined,
    };

    // CU3: wrap token B out of the forwarder into a persistent resource owned by
    // the user. Reuses the mint resource pair, with the forwarder as the
    // "sender" (wallet) of the ephemeral wrap resource.
    const { consumedResource, createdResource } =
      this.transferBuilder.client.createMintResources({
        userAddress: this.chain.genericCallForwarderAddress,
        forwarderAddress: this.chain.forwarderAddress,
        token: input.tokenB.address,
        quantity: input.minBuyAmount,
        keyring: this.senderKeyring,
      });
    const wrapConsume: ConsumeIntent = {
      type: "EvmAddress",
      address: this.chain.genericCallForwarderAddress,
      permit2Data: buildForwarderWrapPermit2(expirationOffset),
      resource: consumedResource,
      nullifierKey: new NullifierKey(nk),
      token: input.tokenB,
    };
    const persistentBCreate: CreateIntent = {
      resource: createdResource,
      receiver: {
        type: "AnomaAddress",
        userPublicKeys: senderPublicKeys,
        quantity: input.minBuyAmount,
        token: input.tokenB,
      },
    };

    return {
      consumeIntents: [
        ...tokenALeg.consumeIntents,
        genericCallConsume,
        wrapConsume,
      ],
      createIntents: [
        ...tokenALeg.createIntents,
        genericCallPadding,
        persistentBCreate,
      ],
    };
  }
}
