import {
  NullifierKey,
  Digest,
  AuthorizationSigningKey,
  MerkleTree,
  CallType,
  Resource,
  randomBytes,
  AuthorizationVerifyingKey,
} from "@anoma/lib";
import type {
  AuthorizedResources,
  CreateBurnProps,
  CreateTransferProps,
  EphemeralMintProps,
  CreateMintProps,
  CreatedResources,
  PersistentMintProps,
  SplitResources,
} from "types";
import {
  calculateLabelRef,
  calculateValueRefCalltypeUser,
  calculateValueRefFromAuth,
} from "domain/transfer/services";
import { Client, initClient } from "wasm/client";
import { toBase64 } from "lib/utils";
import {
  AUTH_SIGNATURE_DOMAIN,
  PADDING_LOGIC_VK,
  SIMPLE_TRANSFER_ID,
} from "app-constants";

/**
 * Transfer client which provies the necessary resource logic for
 * Anoma Simple Transfer Application
 */
export class TransferLogic extends Client {
  static async init(): Promise<TransferLogic> {
    return initClient(TransferLogic, SIMPLE_TRANSFER_ID);
  }

  createEphemeralMintResource(props: EphemeralMintProps): Resource {
    const { userAddress, forwarderAddress, token, quantity, nkCommitment } =
      props;
    const logicRef = Digest.fromHex(this.digest);
    const nonce = randomBytes();
    const labelRefConsumed = calculateLabelRef(forwarderAddress, token);
    const valueRefConsumed = calculateValueRefCalltypeUser(
      CallType.Wrap,
      userAddress
    );

    return Resource.create(
      logicRef,
      labelRefConsumed,
      BigInt(quantity),
      valueRefConsumed,
      true,
      Digest.fromBytes(nonce),
      nkCommitment
    );
  }

  createPersistentMintResource(props: PersistentMintProps): Resource {
    const {
      authVerifyingKey,
      forwarderAddress,
      token,
      quantity,
      consumedResourceNullifier,
      nkCommitment,
    } = props;
    const logicRef = Digest.fromHex(this.digest);
    const labelRefCreated = calculateLabelRef(forwarderAddress, token);
    const valueRefCreated = calculateValueRefFromAuth(
      AuthorizationVerifyingKey.fromHex(authVerifyingKey)
    );

    return Resource.create(
      logicRef,
      labelRefCreated,
      BigInt(quantity),
      valueRefCreated,
      false,
      consumedResourceNullifier,
      nkCommitment
    );
  }

  createMintResources(props: CreateMintProps): CreatedResources {
    const nk = new NullifierKey(props.nullifierKeypair.nk);
    const nkCommitment = nk.commit();

    const { authVerifyingKey, userAddress, forwarderAddress, token, quantity } =
      props;

    const consumedResource = this.createEphemeralMintResource({
      userAddress,
      forwarderAddress,
      token,
      quantity,
      nkCommitment,
    });
    const consumedResourceNullifier = consumedResource.nullifier(nk);
    if (!consumedResourceNullifier) {
      throw "mint: consumed resource nullifier is undefined";
    }

    const createdResource = this.createPersistentMintResource({
      authVerifyingKey,
      consumedResourceNullifier,
      forwarderAddress,
      token,
      quantity,
      nkCommitment,
    });

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
      authKeypair,
      forwarderAddress,
      quantity,
      receiverNullifierCommitment,
      transferredResourceNullifier,
      receiverVerifyingKey,
      token,
      resource,
    } = props;
    const authSigningKey = AuthorizationSigningKey.fromBytes(
      authKeypair.keys.privateKey
    );
    const receiverAuthVerifyingKey =
      AuthorizationVerifyingKey.fromHex(receiverVerifyingKey);

    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const createdValueRef = calculateValueRefFromAuth(receiverAuthVerifyingKey);
    const createdResource = Resource.create(
      logicRef,
      labelRef,
      BigInt(quantity),
      createdValueRef,
      false,
      transferredResourceNullifier,
      receiverNullifierCommitment
    );

    const createdResourceCommitment = createdResource.commitment();
    const actionTree = new MerkleTree([
      transferredResourceNullifier,
      createdResourceCommitment,
    ]);
    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      authSig,
      actionTree,
      createdResource,
      consumedResource: resource,
    };
  }

  createBurnResource(props: CreateBurnProps): AuthorizedResources {
    const {
      burnResource,
      burnAddress,
      authKeypair,
      burnNullifierKeypair,
      forwarderAddress,
      token,
      quantity,
    } = props;

    const logicRef = Digest.fromHex(this.digest);
    const labelRef = calculateLabelRef(forwarderAddress, token);
    const valueRef = calculateValueRefCalltypeUser(
      CallType.Unwrap,
      burnAddress
    );
    const burnNk = new NullifierKey(burnNullifierKeypair.nk);
    const burnResourceNullifier = burnResource.nullifier(burnNk);
    const authSigningKey = AuthorizationSigningKey.fromBytes(
      authKeypair.keys.privateKey
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
    const actionTree = new MerkleTree([
      burnResourceNullifier,
      createdResourceCommitment,
    ]);
    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      authSig,
      actionTree,
      createdResource,
      consumedResource: burnResource,
    };
  }

  createSplitTransfer(props: CreateTransferProps): SplitResources {
    const {
      authKeypair,
      forwarderAddress,
      quantity,
      transferredResourceNullifier,
      receiverNullifierCommitment,
      receiverVerifyingKey,
      resource,
      token,
    } = props;
    const authSigningKey = AuthorizationSigningKey.fromBytes(
      authKeypair.keys.privateKey
    );
    const encodedSplitResource = resource.encode();
    const remainder = encodedSplitResource.quantity - quantity;
    const receiverAuthVerifyingKey =
      AuthorizationVerifyingKey.fromHex(receiverVerifyingKey);

    // Padding resource
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

    // Created Resource
    const createdResource = Resource.create(
      Digest.fromHex(this.digest),
      calculateLabelRef(forwarderAddress, token),
      quantity,
      calculateValueRefFromAuth(receiverAuthVerifyingKey),
      false,
      transferredResourceNullifier,
      receiverNullifierCommitment
    );
    const createdResourceCommitment = createdResource.commitment();

    // Remainder Resource
    const remainderResource = Resource.decode({
      ...encodedSplitResource,
      quantity: remainder,
      nonce: toBase64(paddingResourceNullifier.toBytes()),
    });

    const actionTree = new MerkleTree([
      transferredResourceNullifier,
      createdResourceCommitment,
      paddingResourceNullifier,
      remainderResource.commitment(),
    ]);
    const authSig = authSigningKey.authorize(AUTH_SIGNATURE_DOMAIN, actionTree);

    return {
      actionTree,
      authSig,
      paddingResource,
      consumedResource: resource,
      createdResource,
      remainderResource,
    };
  }
}
