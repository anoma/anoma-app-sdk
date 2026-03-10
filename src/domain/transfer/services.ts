import {
  AUTH_SIGNATURE_DOMAIN,
  averageTimePerProofInSeconds,
  TRIVIAL_LOGIC_VERIFYING_KEY,
} from "app-constants";
import { appConfig } from "config/app";
import { fromHex, normalizeHex, toBase64 } from "lib/utils";
import type {
  AppResource,
  AuthorizedResources,
  CreatedResources,
  CreatedWitnessData,
  Parameters,
  TokenRegistry,
  UserKeyring,
} from "types";
import type { Address, Hex } from "viem";
import {
  AuthoritySignature,
  AuthoritySigningKey,
  AuthorityVerifyingKey,
  Digest,
  hashBytes,
  MerkleTree,
  NullifierKey,
  PublicKey,
  randomBytes,
  Resource,
} from "wasm";

/** Estimates the total proving time for a transfer based on the number of resources. */
export const estimateTransferTimeInSeconds = (parameters?: Parameters) => {
  const averageProofPerResource = 1;
  const resourcesAmount =
    parameters ?
      parameters.consumed_resources.length + parameters.created_resources.length
    : 0;
  return (
    resourcesAmount * averageTimePerProofInSeconds * averageProofPerResource
  );
};

/** Computes the label reference digest from a forwarder and token contract address. */
export function calculateLabelRef(
  forwarderAddress: Address,
  tokenAddress: Address
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const erc20Bytes = fromHex(tokenAddress);
  return hashBytes(new Uint8Array([...forwarderBytes, ...erc20Bytes]));
}

/** Computes the value reference digest from an authority verifying key and encryption public key. */
export function calculateValueRefFromAuth(
  authorizationVerifyingKey: AuthorityVerifyingKey,
  encryptionPublicKey: Hex
): Digest {
  return hashBytes(
    new Uint8Array([
      ...authorizationVerifyingKey.toBytes(),
      ...fromHex(encryptionPublicKey),
    ])
  );
}

/** Computes the value reference digest from an EVM user address, zero-padded to 32 bytes. */
export function calculateValueRefFromUserAddress(userAddress: string): Digest {
  // Padding with zero to fill the 32 bytes required by value_ref
  const paddedAddress = normalizeHex(userAddress).padEnd(64, "0");
  return Digest.fromHex(paddedAddress);
}

/**
 * This method copmares a resource with a target quantity, and if the Resource
 * quantity is greater than the target, this function will return the resources
 * needed to construct a split transaction, along with the additional action
 * digests for appending to the action tree.
 *
 * A split transfer created resource does not have a corresponding "consumed"
 * resource, so we must provide a "padding" resource in its place, as there
 * must be always be a consumed and created resource in each transfer . This resource
 * uses a different `logic_ref`, and requires the TrivialEphemeral  witness
 * data for proving.
 */
export function checkConstructSplit(
  resource: Resource,
  quantity: bigint
): {
  paddingResource?: Resource;
  remainderResource?: Resource;
  splitActions?: string[];
} {
  const encodedResource = resource.encode();
  const remainder = encodedResource.quantity - quantity;
  if (remainder) {
    const paddingResource = Resource.create(
      Digest.fromHex(TRIVIAL_LOGIC_VERIFYING_KEY),
      Digest.default(),
      0n,
      Digest.default(),
      true,
      Digest.fromBytes(randomBytes()),
      NullifierKey.default().commit()
    );
    const paddingResourceNullifier = paddingResource.nullifier(
      NullifierKey.default()
    );
    const remainderResource = Resource.decode({
      ...encodedResource,
      quantity: remainder,
      nonce: toBase64(paddingResourceNullifier.toBytes()),
    });

    const splitActions: string[] = [
      paddingResourceNullifier.toHex(),
      remainderResource.commitment().toHex(),
    ];

    return {
      paddingResource,
      remainderResource,
      splitActions,
    };
  }

  return {
    paddingResource: undefined,
    remainderResource: undefined,
    splitActions: undefined,
  };
}

/**
 * If a TransferLogic method returns padding and reaminder
 * resources, construct and append the parameters needed to
 * fulfill the request with a split
 */
export function checkMergeSplitParameters(
  parameters: Parameters,
  keyring: UserKeyring,
  tokenContractAddress: Address,
  paddingResource?: Resource,
  remainderResource?: Resource
): Parameters {
  if (remainderResource && paddingResource) {
    parameters.consumed_resources.push({
      resource: paddingResource.encode(),
      nullifier_key: NullifierKey.default().toBase64(),
      witness_data: { TrivialEphemeral: {} },
    });
    const remainderWitnessData: CreatedWitnessData["TokenTransferPersistent"] =
      {
        receiver_discovery_public_key: new PublicKey(
          keyring.discoveryKeyPair.publicKey
        ).toBase64(),
        receiver_encryption_public_key: new PublicKey(
          keyring.encryptionKeyPair.publicKey
        ).toBase64(),
        receiver_authorization_verifying_key: new PublicKey(
          keyring.authorityKeyPair.publicKey
        ).toBase64(),
        token_contract_address: tokenContractAddress,
      };
    parameters.created_resources.push({
      resource: remainderResource.encode(),
      witness_data: { TokenTransferPersistent: remainderWitnessData },
    });
  }
  return parameters;
}

/** Authorizes an array of created resources by signing their combined action tree. */
export function authorizeCreatedResources(
  createdResourcesArray: CreatedResources[],
  authorizationKeyBytes: Uint8Array
): AuthorizedResources[] {
  const actions = createdResourcesArray
    .map(({ actions }) => actions.map(action => Digest.fromHex(action)))
    .flat();
  const authSig = authorizeActions(actions, authorizationKeyBytes);

  return createdResourcesArray.map(createdResources => ({
    ...createdResources,
    authSig,
  }));
}

/**
 * Authorize an array of actions and return the signature
 */
export function authorizeActions(
  actions: Digest[],
  authorizationKeyBytes: Uint8Array
): AuthoritySignature {
  const authorizationKey = AuthoritySigningKey.fromBytes(authorizationKeyBytes);
  const actionTree = new MerkleTree(actions);
  return authorizationKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);
}

/**
 * This method appends any remainder resource from a split to the available resources,
 * to ensure that subsequent resource selections include this new created resource
 */
export function appendRemainderToRemaining(
  resources: CreatedResources[],
  remainingResources: AppResource[],
  token: TokenRegistry
): AppResource[] {
  const remaining: AppResource[] = [...remainingResources];

  /**
   * If construction of these parameters introduced a remainder resource,
   * append to remaining resources for potential selection for paying fees
   */
  const remainderResource: Resource | undefined = resources.find(
    ({ remainderResource }) => Boolean(remainderResource)
  )?.remainderResource;

  if (remainderResource)
    remaining.push({
      ...remainderResource.encode(),
      erc20TokenAddress: token.address,
      isConsumed: false,
      forwarder: appConfig.forwarderAddress,
    });

  return remaining;
}
