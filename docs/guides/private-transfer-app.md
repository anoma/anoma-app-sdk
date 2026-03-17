# Building a Private Transfer App

This guide walks through building a minimal React application that lets users:

1. Create or restore a private keyring using a passkey.
2. Display their Pay Address so others can send them tokens.
3. Deposit ERC-20 tokens into the privacy protocol (mint).
4. View their private token balance.
5. Send a private transfer to another user's Pay Address.
6. Withdraw tokens back to their EVM wallet (burn).

By the end you will have a clear picture of the full SDK integration surface.

## Prerequisites

- Node.js 22+
- A working React project with wagmi configured (see [wagmi Getting Started](https://wagmi.sh/react/getting-started))
- An Anoma Pay backend URL, indexer URL, and Envio URL (contact Heliax for access)

## 1. Install the SDK

```bash
npm install @anonma/anomapay-sdk wagmi viem
```

## 2. Define your config

Create a `config.ts` at your project root:

```ts
// config.ts
import type { Config } from "@anonma/anomapay-sdk";
import {
  BaseMainnetChainId,
  BaseMainnetForwarderContract,
} from "@anonma/anomapay-sdk";

export const anomaPayConfig: Config = {
  permit2Address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  permit2DeadlineOffset: 1_800_000, // 30 minutes
  forwarderAddress: BaseMainnetForwarderContract,
  backendUrl: "https://backend.anoma.money",
  indexerUrl: "https://indexer.anoma.money",
  envioUrl: "https://envio.anoma.money/v1/graphql",
  chain: {
    forwarderAddress: BaseMainnetForwarderContract,
    chainId: BaseMainnetChainId,
    network: "base",
  },
};
```

## 3. Key management

A keyring must be created once and persisted across sessions. The recommended approach for browser apps is to derive it from a WebAuthn passkey, so the user never handles raw key material.

```ts
// hooks/useKeyring.ts
import { useState, useEffect } from "react";
import {
  createUserKeyringFromPasskey,
  serializeUserKeyring,
  deserializeUserKeyring,
  type UserKeyring,
} from "@anonma/anomapay-sdk";

const STORAGE_KEY = "anomapay:keyring";

export function useKeyring() {
  const [keyring, setKeyring] = useState<UserKeyring | null>(null);

  // Restore from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setKeyring(deserializeUserKeyring(stored));
    }
  }, []);

  async function createWithPasskey() {
    // 1. Create a new passkey (or get an existing one) with PRF extension enabled
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "My AnomaPay App" },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: "user@example.com",
          displayName: "User",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        extensions: {
          prf: { eval: { first: new TextEncoder().encode("anoma-pay:keyring-seed") } },
        },
      },
    }) as PublicKeyCredential;

    // 2. Derive the keyring from the PRF output
    const newKeyring = createUserKeyringFromPasskey(credential);

    // 3. Persist to session storage
    sessionStorage.setItem(STORAGE_KEY, serializeUserKeyring(newKeyring));
    setKeyring(newKeyring);
  }

  return { keyring, createWithPasskey };
}
```

::: warning Key storage
`serializeUserKeyring` produces a JSON string that contains private key bytes. Use `sessionStorage` (cleared on tab close) or an encrypted vault. Never put this in `localStorage` unencrypted.
:::

## 4. Display the Pay Address

Once the keyring exists, encode the user's public keys into a Pay Address and show it in the UI:

```tsx
// components/PayAddress.tsx
import {
  encodePayAddress,
  extractUserPublicKeys,
  type UserKeyring,
} from "@anonma/anomapay-sdk";

export function PayAddress({ keyring }: { keyring: UserKeyring }) {
  const payAddress = encodePayAddress(extractUserPublicKeys(keyring));

  return (
    <div>
      <p>Your Pay Address:</p>
      <code>{payAddress}</code>
      <button onClick={() => navigator.clipboard.writeText(payAddress)}>
        Copy
      </button>
    </div>
  );
}
```

## 5. Register keys with the Indexer

The Indexer needs your discovery key pair so it can route incoming resources to you. Call this once after creating the keyring:

```ts
import { IndexerClient } from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

const indexer = new IndexerClient(anomaPayConfig.indexerUrl);

async function registerKeys(keyring: UserKeyring) {
  const encodedKeypair = {
    sk: Buffer.from(keyring.discoveryKeyPair.privateKey).toString("hex"),
    pk: Buffer.from(keyring.discoveryKeyPair.publicKey).toString("hex"),
  };
  await indexer.addKeys(encodedKeypair);
}
```

## 6. Mint (deposit ERC-20 tokens)

Before a user can make private transfers, they need to deposit ERC-20 tokens into the protocol. Mint creates a private in-protocol resource backed by real ERC-20 tokens locked in the forwarder contract.

```ts
// Inside a React component or hook:
import {
  TransferLogic,
  TransferBuilder,
  TransferBackendClient,
  getPermit2Data,
  signPermit,
  toDeadline,
  type UserKeyring,
} from "@anonma/anomapay-sdk";
import { useSignTypedData, useAccount } from "wagmi";
import { anomaPayConfig } from "../config";

const { address: walletAddress } = useAccount();
const { signTypedDataAsync } = useSignTypedData();

async function mint(
  keyring: UserKeyring,
  tokenAddress: `0x${string}`,
  amount: bigint
) {
  const backend = new TransferBackendClient(anomaPayConfig.backendUrl);
  const transferLogic = await TransferLogic.init();
  const transferBuilder = await TransferBuilder.init();

  // 1. Create the mint resource pair
  const { createdResource, consumedResource, actionTree } =
    transferLogic.createMintResources({
      userAddress: walletAddress!,
      forwarderAddress: anomaPayConfig.forwarderAddress,
      token: tokenAddress,
      quantity: amount,
      keyring,
    });

  // 2. Build and sign the Permit2 authorization
  const deadline = toDeadline(anomaPayConfig.permit2DeadlineOffset);
  const nonce = BigInt(Date.now()); // use a proper nonce source in production

  const permit2Props = {
    permit2Address: anomaPayConfig.permit2Address,
    spenderAddress: anomaPayConfig.forwarderAddress,
    deadline,
    chainId: anomaPayConfig.chain.chainId,
    nonce,
    actionTreeRoot: actionTree.root().toHex(),
    token: tokenAddress,
    amount,
  };

  const { signature } = await signPermit(
    signTypedDataAsync,
    permit2Props,
    walletAddress!
  );

  const permit2Data = {
    deadline,
    nonce: nonce.toString(),
    signature,
  };

  // 3. Build Parameters and submit
  const parameters = transferBuilder.buildMintParameters(
    { createdResource, consumedResource },
    permit2Data,
    walletAddress!,
    tokenAddress,
    keyring
  );

  const { transaction_hash: txId } = await backend.transfer(parameters);
  return txId;
}
```

## 7. Fetch and decrypt the private balance

Resources on-chain are encrypted. The SDK decrypts them using the user's encryption private key and checks each one's nullifier status to determine if it has been spent.

```ts
import {
  IndexerClient,
  EnvioClient,
  parseIndexerResourceResponse,
  openResourceMetadata,
  buildTransactionLookup,
  TRANSFER_LOGIC_VERIFYING_KEY,
  type UserKeyring,
  type AppResource,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

const indexer = new IndexerClient(anomaPayConfig.indexerUrl);
const envio = new EnvioClient(anomaPayConfig.envioUrl);

async function fetchBalance(keyring: UserKeyring): Promise<AppResource[]> {
  // 1. Fetch encrypted resource blobs from the indexer
  const discoveryPrivateKeyHex = Buffer.from(
    keyring.discoveryKeyPair.privateKey
  ).toString("hex");
  const { resources: indexerResources } = await indexer.resources(
    discoveryPrivateKeyHex
  );

  // 2. Decrypt and deserialize the blobs
  const decryptedResources = await parseIndexerResourceResponse(
    keyring,
    indexerResources
  );

  // 3. Fetch consumed tags to determine spent status
  const consumedTags = await envio.consumedTags(TRANSFER_LOGIC_VERIFYING_KEY);
  const transactionLookup = buildTransactionLookup(consumedTags);

  // 4. Annotate each resource with consumed/available status
  const appResources = await openResourceMetadata(
    keyring,
    decryptedResources,
    transactionLookup,
    true // only return unspent resources
  );

  return appResources;
}
```

Each `AppResource` includes:
- `quantity` — token amount as `bigint`
- `erc20TokenAddress` — the ERC-20 contract address
- `isConsumed` — whether the resource has been spent
- `transaction` — on-chain EVM transaction metadata (if available)

## 8. Send a private transfer

A private transfer moves tokens from the sender's resource to a new resource encrypted to the receiver's public keys. Use `ParametersDraftResolver` to handle resource selection, padding, and change-back automatically, then `PayloadBuilder` to sign and serialize the payload.

```ts
import {
  TransferBuilder,
  TransferBackendClient,
  ParametersDraftResolver,
  PayloadBuilder,
  decodePayAddress,
  isValidPayAddress,
  type UserKeyring,
  type AppResource,
  type TokenRegistry,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

async function sendTransfer(
  keyring: UserKeyring,
  availableResources: AppResource[],
  receiverPayAddress: string,
  token: TokenRegistry,
  amount: bigint
) {
  // 1. Validate and decode the receiver's Pay Address
  if (!isValidPayAddress(receiverPayAddress)) {
    throw new Error("Invalid Pay Address");
  }
  const receiverPublicKeys = decodePayAddress(receiverPayAddress);

  // 2. Build the transfer parameters
  const transferBuilder = await TransferBuilder.init();
  const resolver = new ParametersDraftResolver(transferBuilder, keyring);

  resolver.addReceiver({
    type: "AnomaAddress",
    userPublicKeys: receiverPublicKeys,
    quantity: amount,
    token,
  });

  const resolved = resolver.build(
    availableResources,
    anomaPayConfig.forwarderAddress
  );

  // 3. Authorize (sign the action tree) and serialize
  const parameters = new PayloadBuilder(keyring, resolved)
    .withAuthorization()
    .build();

  // 4. Submit to the proving backend
  const backend = new TransferBackendClient(anomaPayConfig.backendUrl);
  const { transaction_hash: txId } = await backend.transfer(parameters);
  return txId;
}
```

::: tip Multiple receivers
You can call `resolver.addReceiver(...)` multiple times before `resolver.build(...)` to send to several recipients in a single atomic transaction. `ParametersDraftResolver` automatically selects the minimum set of resources needed and creates change-back resources for any remainder.
:::

## 9. Burn (withdraw back to wallet)

A burn unwraps a private resource and releases the underlying ERC-20 tokens to an EVM address. The flow is identical to a transfer, but the receiver is an `EvmAddress` instead of an `AnomaAddress`.

```ts
import {
  TransferBuilder,
  TransferBackendClient,
  ParametersDraftResolver,
  PayloadBuilder,
  type UserKeyring,
  type AppResource,
  type TokenRegistry,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

async function burn(
  keyring: UserKeyring,
  availableResources: AppResource[],
  token: TokenRegistry,
  amount: bigint,
  withdrawToAddress: `0x${string}`
) {
  const transferBuilder = await TransferBuilder.init();
  const resolver = new ParametersDraftResolver(transferBuilder, keyring);

  resolver.addReceiver({
    type: "EvmAddress",
    address: withdrawToAddress,
    quantity: amount,
    token,
  });

  const resolved = resolver.build(
    availableResources,
    anomaPayConfig.forwarderAddress
  );

  const parameters = new PayloadBuilder(keyring, resolved)
    .withAuthorization()
    .build();

  const backend = new TransferBackendClient(anomaPayConfig.backendUrl);
  const { transaction_hash: txId } = await backend.transfer(parameters);
  return txId;
}
```

## 10. Fee estimation

Before submitting a transaction, you can query the backend for the exact fee amount. The fee breaks down into a flat base fee, a per-resource component, and a percentage of the transfer amount.

```ts
import {
  TransferBackendClient,
  type Parameters,
  type SupportedFeeToken,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

async function estimateFee(
  parameters: Parameters,
  feeToken: SupportedFeeToken = "USDC"
) {
  const backend = new TransferBackendClient(anomaPayConfig.backendUrl);
  const fee = await backend.estimateFee({
    fee_token: feeToken,
    transaction: parameters,
  });

  // fee.base_fee + fee.base_fee_per_resource + fee.percentage_fee = total cost
  const total = fee.base_fee + fee.base_fee_per_resource + fee.percentage_fee;
  console.log(`Estimated fee: ${total} ${fee.token_type}`);
  return fee;
}
```

Supported fee tokens are `"USDC"`, `"USDT"`, `"WETH"`, and `"XAN"`.

## 11. Poll transaction status

After submission, poll until the transaction is proven or has failed:

```ts
import { TransferBackendClient } from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

async function waitForProof(txId: string): Promise<string> {
  const backend = new TransferBackendClient(anomaPayConfig.backendUrl);
  const terminalStates = new Set(["Proven", "Failed", "Unprocessable"]);

  while (true) {
    const { status, hash } = await backend.transactionStatus(txId);

    if (status === "Proven") return hash;
    if (terminalStates.has(status)) {
      throw new Error(`Transaction ended with status: ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}
```

::: tip Proof time
Each resource requires an independent ZK proof. Budget approximately 20 seconds per resource — a simple transfer with no split takes around 60 seconds total.
:::

## What's next

- Read [Concepts → Transfers](/concepts/transfers) for the mental model behind mint, transfer, and burn.
- Read [Configuration](/configuration) for network-specific setup values.
- Browse the [API Reference](/api/) for all exported types and functions.
