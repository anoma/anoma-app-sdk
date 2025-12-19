import {
  type PermitTransferFrom,
  type PermitTransferFromData,
  SignatureTransfer,
  type Witness,
} from "@uniswap/permit2-sdk";
import {
  type Hex,
  hexToNumber,
  slice,
  type TypedDataDomain,
  type WalletClient,
} from "viem";

/**
 * Components of an EIP-712 signature returned by Permit2.
 */
export type PermitSignature = {
  r: Hex;
  s: Hex;
  v: number;
  signature: Hex;
};

export type Permit2Props = {
  permit2Address: Hex;
  spenderAddress: Hex;
  deadline: bigint;
  chainId: number;
  nonce: bigint;
  actionTreeRoot: string;
  token: string;
  amount: bigint;
};

/**
 * Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
 * Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
 * so this is provided as a convenience function.
 */
export function toDeadline(expiration: number): bigint {
  return BigInt(Math.floor((Date.now() + expiration) / 1000));
}

/**
 * Builds the typed data payload used by Permit2 to authorize transfers.
 *
 * @param props - Permit parameters such as token, amount, witness root, and deadline.
 * @returns The domain, type definitions, and message values for signing.
 */
export const getPermit2Data = ({
  actionTreeRoot,
  permit2Address,
  spenderAddress, // Forwarder Address
  amount,
  deadline,
  chainId,
  token,
  nonce,
}: Permit2Props): PermitTransferFromData => {
  const witness: Witness = {
    witnessTypeName: "Witness",
    witnessType: { Witness: [{ name: "actionTreeRoot", type: "bytes32" }] },
    witness: {
      actionTreeRoot,
    },
  };

  const permitTransferFrom: PermitTransferFrom = {
    permitted: {
      token,
      amount,
    },
    spender: spenderAddress,
    nonce,
    deadline,
  };

  const { domain, types, values } = SignatureTransfer.getPermitData(
    permitTransferFrom,
    permit2Address,
    chainId,
    witness
  );

  return {
    domain,
    types,
    values: values as PermitTransferFrom,
  };
};

/**
 * Signs the Permit2 typed data for a given owner and props.
 *
 * @param walletClient - Client capable of signing EIP-712 typed data.
 * @param props - Permit parameters describing the token, witness, and deadlines.
 * @param ownerAddress - Address whose private key authorizes the permit.
 * @returns Split signature along with the original signature hex string.
 */
export const signPermit = async (
  walletClient: WalletClient,
  props: Permit2Props,
  ownerAddress: Hex
): Promise<PermitSignature> => {
  const { domain, types, values } = getPermit2Data(props);
  const signature = await walletClient.signTypedData({
    account: ownerAddress,
    domain: domain as TypedDataDomain,
    message: { ...values },
    primaryType: "PermitWitnessTransferFrom",
    types,
  });
  const [r, s, v] = [
    slice(signature, 0, 32),
    slice(signature, 32, 64),
    slice(signature, 64, 65),
  ];
  return { r, s, v: hexToNumber(v), signature };
};
