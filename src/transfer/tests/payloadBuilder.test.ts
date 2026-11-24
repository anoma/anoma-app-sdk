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
import type {
  ConsumeIntent,
  CreateIntent,
  ResolvedIntent,
  TokenRegistry,
} from "types";
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
  // Interleaved, as a swap is: a created resource sits before a consumed one.
  let intents: ResolvedIntent[];

  beforeAll(() => {
    const nk = new NullifierKey(randomBytes());
    consumeIntents = [consumeIntent(nk), consumeIntent(nk)];
    createIntents = [createIntent(), createIntent(), createIntent()];
    intents = [
      { consume: consumeIntents[0] },
      { create: createIntents[0] },
      { consume: consumeIntents[1] },
      { create: createIntents[1] },
      { create: createIntents[2] },
    ];
  });

  const createdOf = (builder: PayloadBuilder) =>
    builder.intents.flatMap(i => ("create" in i ? [i.create] : []));

  it("derives each created nonce from all consumed nullifiers and its created index", () => {
    const builder = new PayloadBuilder({ intents });
    const nullifiers = consumeIntents.map(({ resource, nullifierKey }) =>
      resource.nullifier(nullifierKey)
    );

    const hex = (digests: Digest[]) => digests.map(d => d.toHex());
    expect(hex(builder.nullifiers)).toEqual(hex(nullifiers));
    const created = createdOf(builder);
    expect(created).toHaveLength(3);
    created.forEach(({ resource }, i) => {
      expect(fromBase64(resource.encode().nonce)).toEqual(
        expectedNonce(i, nullifiers)
      );
    });
  });

  it("keeps every other created resource field", () => {
    const builder = new PayloadBuilder({ intents });
    const { nonce: _, ...before } = createIntents[1].resource.encode();
    const { nonce: __, ...after } = createdOf(builder)[1].resource.encode();
    expect(after).toEqual(before);
  });

  it("signs the action tree in list order", () => {
    const signingKey = new AuthoritySigningKey();
    const builder = new PayloadBuilder({ intents }).withAuthorization(
      new Uint8Array(signingKey.toBytes())
    );
    const signature = builder.authorizationSignature;
    if (!signature) throw new Error("PayloadBuilder did not sign");

    const [nf0, nf1] = builder.nullifiers;
    const [cm0, cm1, cm2] = createdOf(builder).map(({ resource }) =>
      resource.commitment()
    );
    const verify = (leaves: Digest[]) =>
      AuthorityVerifyingKey.fromSigningKey(signingKey).verify(
        AUTH_SIGNATURE_DOMAIN,
        new ActionTree(leaves).root().toBytes(),
        signature
      );

    expect(() => verify([nf0, cm0, nf1, cm1, cm2])).not.toThrow();
    // Consumed-then-created no longer matches an interleaved action.
    expect(() => verify([nf0, nf1, cm0, cm1, cm2])).toThrow();
  });

  it("builds the payload in the same order", () => {
    const { resources } = new PayloadBuilder({ intents }).build();

    expect(
      resources.map(r => ("consumed" in r ? "consumed" : "created"))
    ).toEqual(["consumed", "created", "consumed", "created", "created"]);
  });
});
