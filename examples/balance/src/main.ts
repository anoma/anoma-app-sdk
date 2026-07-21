import {
  aggregateTokenBalances,
  attachNullifiers,
  buildAppResources,
  buildTransactionLookup,
  createUserKeyringFromIkm,
  deserializeResourcesPayload,
  encodePayAddress,
  extractUserPublicKeys,
  fromHex,
  IndexerClient,
  initSync,
  NullifierKey,
  parseNullifyingTransactions,
  pickNonEphemeralResources,
  stringToBytes,
  TransferBackendClient,
  type AggregatedTokenBalance,
  type NetworkConfigurationResponse,
  type SupportedChainConfig,
  type UserKeyring,
} from "@anomaorg/anoma-app-sdk";
import wasmUrl from "@anomaorg/anoma-app-sdk/anomaPayArm.wasm?url";
import { isHex } from "viem";

// Any string. The keyring is derived from it, so it is NOT a private key or a
// mnemonic — never put a real one here. Change it to get a different account.
const seed = "anoma-pay-example-seed-do-not-use-with-real-funds";

const backendUrl = "https://pay.prod.heliax.fyi";
const indexerUrl = "https://galileo.prod.heliax.fyi";

const backend = new TransferBackendClient(backendUrl);
const indexer = new IndexerClient(indexerUrl);

/** Maps a backend network configuration to the chain config the SDK expects. */
const toChainConfig = (
  config: NetworkConfigurationResponse
): SupportedChainConfig => ({
  ...config,
  network: config.chain,
  tokens: config.tokens.map(token => ({ ...token, network: config.chain })),
  feePublicKeys: {
    authorityPublicKey: fromHex(`0x${config.feeAuthorityPk}`),
    discoveryPublicKey: fromHex(`0x${config.feeDiscoveryPk}`),
    encryptionPublicKey: fromHex(`0x${config.feeEncryptionPk}`),
    nullifierKeyCommitment: fromHex(`0x${config.feeNullifierKeyCommitment}`),
  },
});

/**
 * Fetches the user's own resources from the indexer. The indexer only scans for
 * a discovery key it knows, so an unknown key (404) is registered and retried.
 */
const fetchResources = async (keyring: UserKeyring, chainIds: number[]) => {
  const { indexed_contracts } = await indexer.config();
  const contracts = indexed_contracts.filter(c =>
    chainIds.includes(c.chain_id)
  );
  return await indexer.resources(keyring.discoveryKeyPair, contracts);
};

/** Decrypts the indexer resources and aggregates the unspent ones per token. */
const getBalances = async (keyring: UserKeyring) => {
  const chains = (await backend.configuration()).configurations
    .filter(config => config.enabled)
    .map(toChainConfig);

  const indexerResources = await fetchResources(
    keyring,
    chains.map(chain => chain.chainId)
  );

  const decrypted = await deserializeResourcesPayload(
    keyring.encryptionKeyPair.privateKey,
    indexerResources
  );
  const owned = attachNullifiers(
    pickNonEphemeralResources(decrypted),
    new NullifierKey(keyring.nullifierKeyPair.nk)
  );
  const spent = await indexer.nullifyingTransactions(
    owned.map(resource => resource.nullifierHex)
  );
  const available = buildAppResources(
    chains,
    owned,
    buildTransactionLookup(parseNullifyingTransactions(spent))
  );

  // Empty price map: balances are shown in token units, not USD.
  return aggregateTokenBalances(
    available,
    chains.flatMap(chain => chain.tokens),
    {}
  );
};

const $ = <T extends Element>(selector: string, node?: ParentNode): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (node ?? document).querySelector<T>(selector)!;

const status = $<HTMLParagraphElement>("#status");
const list = $<HTMLUListElement>("#balances");
const rowTemplate = $<HTMLTemplateElement>("#balance-row");

/** Clones the `#balance-row` template and fills in one token balance. */
const addBalanceRow = ({ token, formatted }: AggregatedTokenBalance) => {
  const row = rowTemplate.content.cloneNode(true) as DocumentFragment;
  $("[data-token]", row).textContent = `${token.symbol} · ${token.network}`;
  $("[data-amount]", row).textContent = formatted;
  list.append(row);
};

const main = async () => {
  initSync(await fetch(wasmUrl).then(res => res.bytes()));

  const keyring = createUserKeyringFromIkm(
    isHex(seed) ? fromHex(seed) : stringToBytes(seed),
    "anoma-pay:keyring-seed"
  );

  $("#address").textContent = encodePayAddress(extractUserPublicKeys(keyring));

  const { balancesPerToken } = await getBalances(keyring);
  const balances = Object.values(balancesPerToken);

  status.textContent = balances.length === 0 ? "No balances yet" : "";
  balances.forEach(addBalanceRow);
};

main().catch((error: unknown) => {
  status.textContent = String(error);
  status.style.color = "crimson";
});
