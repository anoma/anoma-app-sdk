# Transfers

Anoma Pay uses a **Resource Machine** model. Instead of updating account balances directly, the protocol creates and consumes discrete *resources* — cryptographic objects that each represent a specific token amount owned by a specific user.

This page explains the three transfer operations and how they map to user actions.

## Resources

A resource is an immutable record that contains:

- **Logic ref** — identifies the program that governs this resource's validity rules.
- **Label ref** — identifies the token type (derived from the forwarder and ERC-20 contract addresses).
- **Quantity** — the token amount (in the token's smallest unit).
- **Value ref** — binds the resource to its owner's keys.
- **Nullifier key commitment** — the owner's `cnk`, used to later prove consumption.
- **Nonce** — ensures uniqueness.

Resources are encrypted and stored on-chain. Only the owner can decrypt them (using their `encryptionKeyPair`). Consuming a resource reveals its **nullifier** — a unique tag that proves it was spent without revealing which resource it was.

## The three operations

### Mint (deposit)

A user deposits ERC-20 tokens into the protocol by signing a **Permit2** authorization that transfers tokens from their wallet to the forwarder contract. In exchange, a new private resource representing the deposited amount is created and encrypted to the user.

```
ERC-20 wallet balance → [Mint] → private resource
```

The mint flow requires:
1. `TransferLogic.createMintResources()` — creates the consumed (ephemeral) and created (persistent) resources.
2. Permit2 signing via `getPermit2Data` / `signPermit`.
3. `TransferBuilder.buildMintParameters()` — assembles the `Parameters` payload.
4. `TransferBackendClient.transfer()` — submits to the proving backend.

### Transfer (private send)

A user sends tokens to another user's Pay Address. The sender's resource is consumed; a new resource encrypted to the receiver is created. Neither the amount nor the parties are visible on-chain.

```
sender's resource → [Transfer] → receiver's resource
```

If the sender's resource is larger than the transfer amount, the remainder is automatically split back to the sender as a new resource.

The transfer flow requires:
1. Fetch the sender's available resources via `IndexerClient.resources()`.
2. Select the optimal resource(s) via `selectTransferResources()`.
3. `TransferLogic.createTransferResource()` — creates the new resource for the receiver.
4. `authorizeCreatedResources()` — signs the action tree with the sender's authority key.
5. `TransferBuilder.buildTransferParameters()` — assembles `Parameters`.
6. `TransferBackendClient.transfer()` — submits to the proving backend.

### Burn (withdrawal)

A user withdraws tokens back to their EVM wallet. Their private resource is consumed; an ephemeral resource representing the withdrawal is created.

```
private resource → [Burn] → ERC-20 wallet balance
```

The burn flow follows the same steps as a transfer, using `TransferLogic.createBurnResource()` and `TransferBuilder.buildBurnParameters()`.

## Fee transfers

Every transaction also requires a separate **fee transfer** to a Heliax-controlled fee collector. The SDK handles this transparently via `TransferLogic.createFeeTransferResource()` and `TransferBuilder.buildFeeTransferParameters()`. Fee amounts are obtained from `TransferBackendClient.estimateFee()`.

Supported fee tokens: `WETH`, `USDC`, `XAN`.

## Transaction lifecycle

After submitting `Parameters` to the backend, the transaction moves through these states:

| Status | Meaning |
| --- | --- |
| `New` | Received, awaiting processing |
| `Proving` | ZK proof is being generated |
| `Proven` | Proof ready, submitting to chain |
| `Submitted` | On-chain submission sent |
| `Failed` | Proving or submission failed |
| `Unprocessable` | Parameters were invalid |

Poll `TransferBackendClient.transactionStatus(uuid)` until the status reaches `Proven` or a terminal failure state.

## Resource selection

When a user wants to transfer `N` tokens, `selectTransferResources()` automatically picks the fewest resources needed:

1. If a resource with exactly `N` exists, use it.
2. If resources can be summed to exactly `N`, use the minimum subset.
3. Otherwise, use a resource larger than `N` and split the remainder back to the sender.

See the [Private Transfer App guide](/guides/private-transfer-app) for a complete worked example.
