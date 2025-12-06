use crate::arm::{
    digest::Digest,
    nullifier_key::{NullifierKey, NullifierKeyCommitment},
};
use arm::{nullifier_key::NullifierKeyCommitment as NKC, resource::Resource as R};
use serde::{self, Deserialize, Serialize};

#[cfg(feature = "wasm")]
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
#[cfg(feature = "wasm")]
use tsify::Tsify;
#[cfg(feature = "wasm")]
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[cfg(feature = "wasm")]
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct ResourceProps {
    is_ephemeral: bool,
    quantity: u128,
    logic_ref: String,
    label_ref: String,
    value_ref: String,
    nonce: String,
    rand_seed: String,
    nk_commitment: String,
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Resource(pub(crate) R);

impl Resource {
    pub fn instance(&self) -> &R {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl Resource {
    #[wasm_bindgen(constructor)]
    pub fn new(props: ResourceProps) -> Result<Resource, JsError> {
        let ResourceProps {
            is_ephemeral,
            quantity,
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
        } = props;

        Resource::decode(&EncodedResource {
            is_ephemeral,
            quantity,
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
        })
    }

    pub fn create(
        logic_ref: &Digest,
        label_ref: &Digest,
        quantity: u128,
        value_ref: &Digest,
        is_ephemeral: bool,
        nonce: &Digest,
        nk_cmt: &NullifierKeyCommitment,
    ) -> Resource {
        let r = R::create(
            logic_ref.0,
            label_ref.0,
            quantity,
            value_ref.0,
            is_ephemeral,
            nonce.0,
            nk_cmt.0,
        );
        Resource(r)
    }

    // Support Resource encoding required by Anoma SDK
    pub fn encode(&self) -> EncodedResource {
        let R {
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
            quantity,
            is_ephemeral,
        } = &self.0;

        EncodedResource {
            logic_ref: b64.encode(logic_ref),
            label_ref: b64.encode(label_ref),
            value_ref: b64.encode(value_ref),
            nonce: b64.encode(nonce),
            rand_seed: b64.encode(rand_seed),
            nk_commitment: b64.encode(nk_commitment.inner()),
            quantity: *quantity,
            is_ephemeral: *is_ephemeral,
        }
    }

    // Support decoding from Anoma SDK Resource
    pub fn decode(encoded: &EncodedResource) -> Result<Resource, JsError> {
        let EncodedResource {
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
            quantity,
            is_ephemeral,
        } = encoded;

        let nonce_bytes = b64.decode(nonce)?;
        let nonce: [u8; 32] = nonce_bytes
            .try_into()
            .map_err(|_| JsError::new("Invalid nonce"))?;

        let rand_seed_bytes = b64.decode(rand_seed)?;
        let rand_seed: [u8; 32] = rand_seed_bytes
            .try_into()
            .map_err(|_| JsError::new("Invalid nonce"))?;

        Ok(Resource(R {
            logic_ref: Digest::from_bytes(&b64.decode(logic_ref)?)?.0,
            label_ref: Digest::from_bytes(&b64.decode(label_ref)?)?.0,
            value_ref: Digest::from_bytes(&b64.decode(value_ref)?)?.0,
            nonce,
            rand_seed,
            nk_commitment: NKC::from_bytes(&b64.decode(nk_commitment)?)?,
            quantity: *quantity,
            is_ephemeral: *is_ephemeral,
        }))
    }

    pub fn commitment(&self) -> Digest {
        Digest(self.0.commitment())
    }

    pub fn nullifier(&self, nf_key: &NullifierKey) -> Result<Digest, JsError> {
        Ok(Digest(self.0.nullifier(&nf_key.0)?))
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Resource, JsError> {
        Ok(Resource(R::from_bytes(bytes)?))
    }
}

#[cfg(feature = "wasm")]
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EncodedResource {
    pub is_ephemeral: bool,
    pub quantity: u128,
    pub logic_ref: String,
    pub label_ref: String,
    pub value_ref: String,
    pub nonce: String,
    pub rand_seed: String,
    pub nk_commitment: String,
}
