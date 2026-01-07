import { SIMPLE_TRANSFER_ID } from "app-constants";
import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
  checkConstructSplit,
  tokenSymbolToLabelRef,
} from "domain/transfer/services";
import { toHex } from "lib/utils";
import type {
  CreateBurnProps,
  CreateFeeTransferProps,
  CreateMintProps,
  CreateTransferProps,
  CreatedResources,
  MintResources,
} from "types";
import {
  AuthorizationVerifyingKey,
  Digest,
  HeliaxKeys,
  MerkleTree,
  NullifierKey,
  NullifierKeyCommitment,
  Resource,
  randomBytes,
} from "wasm";

import { Client, initClient } from "wasm/client";

/**
 * Transfer client which provies the necessary resource logic for
 * Anoma Simple Transfer Application
 */
export class TransferLogic extends Client {
  static async init(): Promise<TransferLogic> {
    return initClient(TransferLogic, SIMPLE_TRANSFER_ID);
  }

  createMintResources(props: CreateMintProps): MintResources {
    const { userAddress, forwarderAddress, token, quantity, keyring } = props;

    const nk = new NullifierKey(keyring.nullifierKeyPair.nk);
    const nkCommitment = nk.commit();
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);

    const consumedResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      calculateValueRefFromUserAddress(userAddress),
      true,
      Digest.fromBytes(randomBytes()),
      nkCommitment
    );

    const consumedResourceNullifier = consumedResource.nullifier(nk);
    if (!consumedResourceNullifier) {
      throw "mint: consumed resource nullifier is undefined";
    }

    const createdResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      calculateValueRefFromAuth(
        new AuthorizationVerifyingKey(keyring.authorityKeyPair.publicKey),
        toHex(keyring.encryptionKeyPair.publicKey)
      ),
      false,
      consumedResourceNullifier,
      nkCommitment
    );

    const createdResourceCommitment = createdResource.commitment();
    const actionTree = new MerkleTree([
      consumedResourceNullifier,
      createdResourceCommitment,
    ]);

    return {
      actionTree,
      createdResource,
      consumedResource,
    };
  }

  createTransferResource(props: CreateTransferProps): CreatedResources {
    const {
      forwarderAddress,
      quantity,
      token,
      resource,
      keyring,
      receiverKeyring,
    } = props;
    const receiverAuthVerifyingKey = new AuthorizationVerifyingKey(
      receiverKeyring.authorityPublicKey
    );

    const nullifierKey = new NullifierKey(keyring.nullifierKeyPair.nk);
    const transferredResourceNullifier = resource.nullifier(nullifierKey);
    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const createdValueRef = calculateValueRefFromAuth(
      receiverAuthVerifyingKey,
      toHex(receiverKeyring.encryptionPublicKey)
    );
    const createdResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      createdValueRef,
      false,
      transferredResourceNullifier,
      new NullifierKeyCommitment(receiverKeyring.nullifierKeyCommitment)
    );
    const createdResourceCommitment = createdResource.commitment();

    const actions: Digest[] = [
      transferredResourceNullifier,
      createdResourceCommitment,
    ];

    const {
      paddingResource,
      remainderResource,
      splitActions = [],
    } = checkConstructSplit(resource, quantity);

    return {
      actions: [...actions, ...splitActions],
      createdResource,
      consumedResource: resource,
      paddingResource,
      remainderResource,
    };
  }

  createBurnResource(props: CreateBurnProps): CreatedResources {
    const {
      burnResource,
      burnAddress,
      forwarderAddress,
      token,
      quantity,
      keyring,
    } = props;

    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const valueRef = calculateValueRefFromUserAddress(burnAddress);
    const burnNk = new NullifierKey(keyring.nullifierKeyPair.nk);
    const burnResourceNullifier = burnResource.nullifier(burnNk);

    const createdResource = Resource.create(
      logicRef,
      labelRef,
      quantity,
      valueRef,
      true,
      burnResourceNullifier,
      burnNk.commit()
    );
    const createdResourceCommitment = createdResource.commitment();

    const actions: Digest[] = [
      burnResourceNullifier,
      createdResourceCommitment,
    ];

    const {
      paddingResource,
      remainderResource,
      splitActions = [],
    } = checkConstructSplit(burnResource, quantity);

    return {
      actions: [...actions, ...splitActions],
      createdResource,
      consumedResource: burnResource,
      paddingResource,
      remainderResource,
    };
  }

  createFeeTransferResource({
    resource,
    tokenSymbol,
    quantity,
    keyring,
  }: CreateFeeTransferProps): CreatedResources {
    const {
      HELIAX_FEE_LOGIC_REF,
      HELIAX_FEE_VALUE_REF,
      HELIAX_FEE_NULLIFIER_KEY_COMMITMENT,
    } = HeliaxKeys;
    const transferredResourceNullifier = resource.nullifier(
      new NullifierKey(keyring.nullifierKeyPair.nk)
    );
    const tokenLabelRef = tokenSymbolToLabelRef(tokenSymbol);

    const createdResource = Resource.create(
      Digest.fromHex(HELIAX_FEE_LOGIC_REF),
      Digest.fromHex(tokenLabelRef),
      BigInt(quantity),
      Digest.fromHex(HELIAX_FEE_VALUE_REF),
      false,
      transferredResourceNullifier,
      NullifierKeyCommitment.fromBase64(HELIAX_FEE_NULLIFIER_KEY_COMMITMENT)
    );

    const createdResourceCommitment = createdResource.commitment();

    const actions: Digest[] = [
      transferredResourceNullifier,
      createdResourceCommitment,
    ];

    const {
      paddingResource,
      remainderResource,
      splitActions = [],
    } = checkConstructSplit(resource, quantity);

    return {
      actions: [...actions, ...splitActions],
      createdResource,
      consumedResource: resource,
      paddingResource,
      remainderResource,
    };
  }
}
