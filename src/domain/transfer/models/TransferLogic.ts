import { AUTH_SIGNATURE_DOMAIN, SIMPLE_TRANSFER_ID } from "app-constants";
import {
  calculateLabelRef,
  calculateValueRefFromAuth,
  calculateValueRefFromUserAddress,
  checkConstructSplit,
  tokenSymbolToLabelRef,
} from "domain/transfer/services";
import { toHex } from "lib/utils";
import type {
  AuthorizedResources,
  CreateBurnProps,
  CreateFeeTransferProps,
  CreateMintProps,
  CreateTransferProps,
  CreatedResources,
} from "types";
import {
  AuthorizationSigningKey,
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

  createMintResources(props: CreateMintProps): CreatedResources {
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

  createTransferResource(props: CreateTransferProps): AuthorizedResources {
    const {
      forwarderAddress,
      quantity,
      token,
      resource,
      keyring,
      receiverKeyring,
    } = props;
    const authSigningKey = AuthorizationSigningKey.fromBytes(
      keyring.authorityKeyPair.privateKey
    );
    const receiverAuthVerifyingKey = new AuthorizationVerifyingKey(
      receiverKeyring.authorityPublicKey
    );

    const transferredResourceNullifier = resource.nullifier(
      new NullifierKey(keyring.nullifierKeyPair.nk)
    );
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

    const actionTree = new MerkleTree([...actions, ...splitActions]);
    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      authSig,
      actionTree,
      createdResource,
      consumedResource: resource,
      paddingResource,
      remainderResource,
    };
  }

  createBurnResource(props: CreateBurnProps): AuthorizedResources {
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
    const authSigningKey = AuthorizationSigningKey.fromBytes(
      keyring.authorityKeyPair.privateKey
    );

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

    const actionTree = new MerkleTree([...actions, ...splitActions]);
    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      authSig,
      actionTree,
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
  }: CreateFeeTransferProps): AuthorizedResources {
    const {
      HELIAX_FEE_LOGIC_REF,
      HELIAX_FEE_VALUE_REF,
      HELIAX_FEE_NULLIFIER_KEY_COMMITMENT,
    } = HeliaxKeys;
    const transferredResourceNullifier = resource.nullifier(
      new NullifierKey(keyring.nullifierKeyPair.nk)
    );

    const authSigningKey = AuthorizationSigningKey.fromBytes(
      keyring.authorityKeyPair.privateKey
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

    const actionTree = new MerkleTree([...actions, ...splitActions]);

    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      authSig,
      actionTree,
      createdResource,
      consumedResource: resource,
      paddingResource,
      remainderResource,
    };
  }
}
