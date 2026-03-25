# Configuration

The `Config` type describes the runtime configuration required to connect to the Anoma Pay infrastructure. Pass it when constructing API clients or bootstrapping your application.

## Type reference

```ts
type Config = {
  permit2Address: Address;
  permit2DeadlineOffset: number;
  forwarderAddress: Address;
  backendUrl: string;
  indexerUrl: string;
  envioUrl: string;
  chain: ChainSettings;
};
```

## Fields

### `permit2Address`

The deployed address of the [Permit2](https://github.com/Uniswap/permit2) contract on the target chain. This is a canonical Uniswap-deployed contract and does not change per environment.

### `permit2DeadlineOffset`

How far in the future (in milliseconds) the Permit2 signature deadline is set. A value of `1_800_000` (30 minutes) is a reasonable default.

### `forwarderAddress`

The AnomaPay forwarder contract that accepts Permit2 transfers and routes tokens into the Resource Machine. Use the address for your target chain:

| Network | Address |
| --- | --- |
| Ethereum Mainnet | `0x775C81A47F2618a8594a7a7f4A3Df2a300337559` |
| Ethereum Sepolia | `0x0A62bE41E66841f693f922991C4e40C89cb0CFDF` |
| Base Mainnet | `0xfAa9DE773Be11fc759A16F294d32BB2261bF818B` |

### `backendUrl`

Base URL of the AnomaPay proving backend (used by `TransferBackendClient`).

### `indexerUrl`

Base URL of the AnomaPay Indexer (used by `IndexerClient`).

### `envioUrl`

GraphQL endpoint of the Envio indexer (used by `EnvioClient`).

### `chain`

A `ChainSettings` object:

```ts
type ChainSettings = {
  forwarderAddress: Address;
  chainId: SupportedChainId;
  network: Network;
};
```

Supported chain IDs: `1` (Ethereum), `11155111` (Sepolia), `8453` (Base).

## Example configs

### Base Mainnet

```ts
import { BaseMainnetChainId, BaseMainnetForwarderContract } from "@anonma/anomapay-sdk";

const config: Config = {
  permit2Address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  permit2DeadlineOffset: 1_800_000,
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

### Ethereum Sepolia (testnet)

```ts
import { EthereumSepoliaChainId, EthereumSepoliaForwarderContract } from "@anonma/anomapay-sdk";

const config: Config = {
  permit2Address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  permit2DeadlineOffset: 1_800_000,
  forwarderAddress: EthereumSepoliaForwarderContract,
  backendUrl: "https://backend-sepolia.anoma.money",
  indexerUrl: "https://indexer-sepolia.anoma.money",
  envioUrl: "https://envio-sepolia.anoma.money/v1/graphql",
  chain: {
    forwarderAddress: EthereumSepoliaForwarderContract,
    chainId: EthereumSepoliaChainId,
    network: "ethereum-sepolia",
  },
};
```

## Constructing API clients

```ts
import {
  IndexerClient,
  TransferBackendClient,
  EnvioClient,
} from "@anonma/anomapay-sdk";

const indexer = new IndexerClient(config.indexerUrl);
const backend = new TransferBackendClient(config.backendUrl);
const envio = new EnvioClient(config.envioUrl);
```
