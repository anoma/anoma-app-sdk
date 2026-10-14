import {
  ActionTree,
  AuthoritySigningKey,
  AuthorityVerifyingKey,
  Digest,
  NullifierKey,
  randomBytes,
  Resource,
} from "@anomaorg/arm-bindings";
import { sha256 } from "@noble/hashes/sha2";
import { fromBase64 } from "primitives";
import type { ConsumeIntent, CreateIntent, TokenRegistry } from "types";
import { beforeAll, describe, expect, it } from "vitest";
import { initSdk } from "../..";
import { PayloadBuilder } from "../models/PayloadBuilder";
import { AUTH_SIGNATURE_DOMAIN } from "../services";

beforeAll(async () => {
  await initSdk();
});

const token = {
  address: "0x1111111111111111111111111111111111111111",
} as unknown as TokenRegistry;

const resource = (nonce: Digest, nk: NullifierKey) =>
  Resource.create(
    Digest.fromBytes(randomBytes()),
    Digest.fromBytes(randomBytes()),
    1n,
    Digest.fromBytes(randomBytes()),
    true,
    nonce,
    nk.commit()
  );

const consumeIntent = (nk: NullifierKey): ConsumeIntent => ({
  type: "GenericCall",
  forwarderAddress: token.address,
  calls: [],
  resource: resource(Digest.fromBytes(randomBytes()), nk),
  nullifierKey: nk,
});

const createIntent = (): CreateIntent => ({
  resource: resource(Digest.zero(), NullifierKey.zero()),
  receiver: { type: "EvmAddress", address: token.address, token, quantity: 1n },
});

// Spec: sha256("ARM_NONCE_DERIVATION" || u32_be(index) || sha256(nf_0 || … || nf_n))
const expectedNonce = (index: number, nullifiers: Digest[]) => {
  const index_be = new Uint8Array(4);
  new DataView(index_be.buffer).setUint32(0, index);
  return sha256(
    new Uint8Array([
      ...new TextEncoder().encode("ARM_NONCE_DERIVATION"),
      ...index_be,
      ...sha256(new Uint8Array(nullifiers.flatMap(nf => [...nf.toBytes()]))),
    ])
  );
};

describe("PayloadBuilder", () => {
  let consumeIntents: ConsumeIntent[];
  let createIntents: CreateIntent[];

  beforeAll(() => {
    const nk = new NullifierKey(randomBytes());
    consumeIntents = [consumeIntent(nk), consumeIntent(nk)];
    // More created than consumed: no padding is needed to pair them up.
    createIntents = [createIntent(), createIntent(), createIntent()];
  });

  it("derives each created nonce from all consumed nullifiers and its index", () => {
    const builder = new PayloadBuilder({ consumeIntents, createIntents });
    const nullifiers = consumeIntents.map(({ resource, nullifierKey }) =>
      resource.nullifier(nullifierKey)
    );

    expect(builder.createIntents).toHaveLength(3);
    builder.createIntents.forEach(({ resource }, i) => {
      expect(fromBase64(resource.encode().nonce)).toEqual(
        expectedNonce(i, nullifiers)
      );
    });
  });

  it("keeps every other created resource field", () => {
    const builder = new PayloadBuilder({ consumeIntents, createIntents });
    const { nonce: _, ...before } = createIntents[1].resource.encode();
    const { nonce: __, ...after } = builder.createIntents[1].resource.encode();
    expect(after).toEqual(before);
  });

  it("signs the action tree as all nullifiers, then all commitments", () => {
    const signingKey = new AuthoritySigningKey();
    const builder = new PayloadBuilder({
      consumeIntents,
      createIntents,
    }).withAuthorization(new Uint8Array(signingKey.toBytes()));
    const signature = builder.authorizationSignature;
    if (!signature) throw new Error("PayloadBuilder did not sign");

    const nullifiers = builder.nullifiers;
    const commitments = builder.createIntents.map(({ resource }) =>
      resource.commitment()
    );
    const verify = (leaves: Digest[]) =>
      AuthorityVerifyingKey.fromSigningKey(signingKey).verify(
        AUTH_SIGNATURE_DOMAIN,
        new ActionTree(leaves).root().toBytes(),
        signature
      );

    expect(() => verify([...nullifiers, ...commitments])).not.toThrow();
    // v1 interleaved order must no longer match.
    expect(() =>
      verify([
        nullifiers[0],
        commitments[0],
        nullifiers[1],
        commitments[1],
        commitments[2],
      ])
    ).toThrow();
  });
});
