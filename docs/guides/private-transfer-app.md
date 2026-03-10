# Building a Private Transfer App

This guide walks through building a minimal React application that lets users:

1. Create or restore a private keyring using a passkey.
2. Display their Pay Address so others can send them tokens.
3. View their private token balance.
4. Send a private transfer to another user's Pay Address.
5. Withdraw tokens back to their EVM wallet (burn).

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
  // EncodedKeypair shape expected by the indexer
  const encodedKeypair = {
    sk: Buffer.from(keyring.discoveryKeyPair.privateKey).toString("hex"),
    pk: Buffer.from(keyring.discoveryKeyPair.publicKey).toString("hex"),
  };
  await indexer.addKeys(encodedKeypair);
}
```

## 6. Fetch and decrypt the private balance

Resources on-chain are encrypted. The SDK decrypts them using the user's encryption private key and checks each one's nullifier status to determine if it has been spent.

```ts
import {
  IndexerClient,
  EnvioClient,
  parseIndexerResourceResponse,
  openResourceMetadata,
  buildTransactionLookup,
  type UserKeyring,
  type AppResource,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";
import { TRANSFER_LOGIC_VERIFYING_KEY } from "@anonma/anomapay-sdk";

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

  // 4. Annotate each resource with its consumed/available status
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
- `createdTransaction` / `consumedTransaction` — on-chain transaction metadata

## 7. Send a private transfer

A private transfer moves tokens from the sender's resource to a new resource encrypted to the receiver. This is the most involved flow.

```ts
import {
  TransferLogic,
  TransferBuilder,
  TransferBackendClient,
  IndexerClient,
  EnvioClient,
  decodePayAddress,
  isValidPayAddress,
  selectTransferResources,
  authorizeCreatedResources,
  mergeParameters,
  type UserKeyring,
  type AppResource,
} from "@anonma/anomapay-sdk";
import { anomaPayConfig } from "../config";

const backend = new TransferBackendClient(anomaPayConfig.backendUrl);

async function sendTransfer(
  keyring: UserKeyring,
  availableResources: AppResource[],
  receiverPayAddress: string,
  tokenAddress: `0x${string}`,
  amount: bigint
) {
  // 1. Validate and decode the receiver's Pay Address
  if (!isValidPayAddress(receiverPayAddress)) {
    throw new Error("Invalid Pay Address");
  }
  const receiverPublicKeys = decodePayAddress(receiverPayAddress);

  // 2. Select the optimal resource(s) for the transfer amount
  const resourcesForToken = availableResources.filter(
    (r) => r.erc20TokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  );
  const transferResources = selectTransferResources(resourcesForToken, amount);

  // 3. Initialise the transfer client (loads WASM)
  const transferLogic = await TransferLogic.init();
  const transferBuilder = await TransferBuilder.init();

  // 4. Build and authorize resource pairs for each selected resource
  const createdResourceSets = transferResources.map(([encodedResource, quantity]) => {
    const resource = /* reconstruct Resource from EncodedResource */;
    return transferLogic.createTransferResource({
      resource,
      forwarderAddress: anomaPayConfig.forwarderAddress,
      token: tokenAddress,
      quantity,
      keyring,
      receiverKeyring: receiverPublicKeys,
    });
  });

  const authorizedSets = authorizeCreatedResources(
    createdResourceSets,
    keyring.authorityKeyPair.privateKey
  );

  // 5. Build the Parameters payload for each authorized resource set
  const parametersList = authorizedSets.map((authorized) =>
    transferBuilder.buildTransferParameters(
      authorized,
      keyring,
      receiverPublicKeys,
      tokenAddress
    )
  );

  // 6. Merge into a single Parameters object and submit
  const parameters = mergeParameters(parametersList);
  const { transaction_hash: uuid } = await backend.transfer(parameters);

  return uuid;
}
```

## 8. Poll transaction status

After submission, poll until the transaction is proven or has failed:

```ts
import { TransferBackendClient } from "@anonma/anomapay-sdk";

const backend = new TransferBackendClient(anomaPayConfig.backendUrl);

async function waitForProof(uuid: string): Promise<string> {
  const terminalStates = new Set(["Proven", "Failed", "Unprocessable"]);

  while (true) {
    const { status, hash } = await backend.transactionStatus(uuid as any);

    if (status === "Proven") return hash;
    if (terminalStates.has(status)) {
      throw new Error(`Transaction ended with status: ${status}`);
    }

    // Wait 5 seconds before polling again
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}
```

::: tip Proof time
Each resource requires an independent ZK proof. Budget approximately 20 seconds per resource — a simple transfer with no split takes ~60 seconds total (2 resources + 2 fee resources).
:::

## 9. Mint (deposit ERC-20 tokens)

Before a user can make private transfers, they need to deposit ERC-20 tokens into the protocol. This is the "mint" operation.

```ts
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

// Inside a React component:
const { address: walletAddress } = useAccount();
const { signTypedDataAsync } = useSignTypedData();

async function mint(
  keyring: UserKeyring,
  tokenAddress: `0x${string}`,
  amount: bigint
) {
  const transferLogic = await TransferLogic.init();
  const transferBuilder = await TransferBuilder.init();

  // 1. Create the mint resources
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

  const { signature, r, s, v } = await signPermit(
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

  const { transaction_hash: uuid } = await backend.transfer(parameters);
  return uuid;
}
```

## 10. Burn (withdraw back to wallet)

```ts
async function burn(
  keyring: UserKeyring,
  resource: AppResource,
  amount: bigint,
  withdrawToAddress: `0x${string}`
) {
  const transferLogic = await TransferLogic.init();
  const transferBuilder = await TransferBuilder.init();

  const burnResourceSet = transferLogic.createBurnResource({
    burnResource: /* Resource from AppResource */,
    burnAddress: withdrawToAddress,
    forwarderAddress: anomaPayConfig.forwarderAddress,
    token: resource.erc20TokenAddress,
    quantity: amount,
    keyring,
  });

  const [authorized] = authorizeCreatedResources(
    [burnResourceSet],
    keyring.authorityKeyPair.privateKey
  );

  const parameters = transferBuilder.buildBurnParameters(
    authorized,
    keyring,
    resource.erc20TokenAddress,
    withdrawToAddress
  );

  const { transaction_hash: uuid } = await backend.transfer(parameters);
  return uuid;
}
```

## What's next

- Read [Concepts → Transfers](/concepts/transfers) for the mental model behind mint, transfer, and burn.
- Read [Configuration](/configuration) for network-specific setup values.
- Browse the [API Reference](/api/) for all exported types and functions.
