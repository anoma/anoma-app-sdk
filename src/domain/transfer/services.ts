import { PADDING_LOGIC_VK } from "app-constants";
import { fromHex, normalizeHex, toBase64 } from "lib/utils";
import type {
  CreatedWitnessData,
  FeeCompatibleERC20,
  Parameters,
  UserKeyring,
} from "types";
import type { Address } from "viem";
import {
  AuthorizationVerifyingKey,
  Digest,
  hashBytes,
  HeliaxKeys,
  NullifierKey,
  PublicKey,
  randomBytes,
  Resource,
} from "wasm";

export function calculateLabelRef(
  forwarderAddress: string,
  tokenAddress: string
): Digest {
  const forwarderBytes = fromHex(forwarderAddress);
  const erc20Bytes = fromHex(tokenAddress);
  return hashBytes(new Uint8Array([...forwarderBytes, ...erc20Bytes]));
}

export function calculateValueRefFromAuth(
  authorizationVerifyingKey: AuthorizationVerifyingKey,
  encryptionPublicKey: string
): Digest {
  return hashBytes(
    new Uint8Array([
      ...authorizationVerifyingKey.toBytes(),
      ...fromHex(encryptionPublicKey),
    ])
  );
}

export function calculateValueRefFromUserAddress(userAddress: string): Digest {
  // Padding with zero to fill the 32 bytes required by value_ref
  const paddedAddress = normalizeHex(userAddress).padEnd(64, "0");
  return Digest.fromHex(paddedAddress);
}

export const tokenSymbolToLabelRef = (tokenSymbol: FeeCompatibleERC20) => {
  const {
    HELIAX_FEE_LABEL_REF_WETH,
    HELIAX_FEE_LABEL_REF_XAN,
    HELIAX_FEE_LABEL_REF_USDC,
  } = HeliaxKeys;
  switch (tokenSymbol) {
    case "USDC":
      return HELIAX_FEE_LABEL_REF_USDC;
    case "XAN":
      return HELIAX_FEE_LABEL_REF_XAN;
    case "WETH":
      return HELIAX_FEE_LABEL_REF_WETH;
    default:
      throw new Error("Invalid fee token!");
  }
};

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
  splitActions?: Digest[];
} {
  const encodedResource = resource.encode();
  const remainder = encodedResource.quantity - quantity;
  if (remainder) {
    const paddingResource = Resource.create(
      Digest.fromHex(PADDING_LOGIC_VK),
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

    const splitActions: Digest[] = [
      paddingResourceNullifier,
      remainderResource.commitment(),
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
    const remainderWitnessData: CreatedWitnessData["Persistent"] = {
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
      witness_data: { Persistent: remainderWitnessData },
    });
  }
  return parameters;
}
