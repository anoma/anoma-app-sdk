use crate::arm::{
    digest::Digest,
    encryption::{Ciphertext, SecretKey},
    nullifier_key::{NullifierKey, NullifierKeyCommitment},
};
use crate::error::BindingsError;
use arm::{nullifier_key::NullifierKeyCommitment as NKC, resource::Resource as R};
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use serde::{self, Deserialize, Serialize};

/// Quantities are decimal strings because u128 cannot cross the FFI boundary.
#[derive(Debug, uniffi::Record)]
pub struct ResourceProps {
    is_ephemeral: bool,
    quantity: String,
    logic_ref: String,
    label_ref: String,
    value_ref: String,
    nonce: String,
    rand_seed: String,
    nk_commitment: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, uniffi::Object)]
pub struct Resource(pub(crate) R);

impl Resource {
    pub fn instance(&self) -> &R {
        &self.0
    }
}

fn parse_quantity(quantity: &str) -> Result<u128, BindingsError> {
    quantity
        .parse::<u128>()
        .map_err(|e| BindingsError::new(format!("Invalid quantity: {}", e)))
}

#[uniffi::export]
impl Resource {
    #[uniffi::constructor]
    pub fn new(props: ResourceProps) -> Result<Resource, BindingsError> {
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

        Resource::decode(EncodedResource {
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

    #[uniffi::constructor]
    pub fn create(
        logic_ref: &Digest,
        label_ref: &Digest,
        quantity: String,
        value_ref: &Digest,
        is_ephemeral: bool,
        nonce: &Digest,
        nk_cmt: &NullifierKeyCommitment,
    ) -> Result<Resource, BindingsError> {
        let r = R::create(
            logic_ref.0,
            label_ref.0,
            parse_quantity(&quantity)?,
            value_ref.0,
            is_ephemeral,
            nonce.0,
            nk_cmt.0,
        );
        Ok(Resource(r))
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
            quantity: quantity.to_string(),
            is_ephemeral: *is_ephemeral,
        }
    }

    // Support decoding from Anoma SDK Resource
    #[uniffi::constructor]
    pub fn decode(encoded: EncodedResource) -> Result<Resource, BindingsError> {
        let EncodedResource {
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
            quantity,
            is_ephemeral,
        } = &encoded;

        let nonce_bytes = b64.decode(nonce)?;
        let nonce: [u8; 32] = nonce_bytes
            .try_into()
            .map_err(|_| BindingsError::new("Invalid nonce"))?;

        let rand_seed_bytes = b64.decode(rand_seed)?;
        let rand_seed: [u8; 32] = rand_seed_bytes
            .try_into()
            .map_err(|_| BindingsError::new("Invalid nonce"))?;

        Ok(Resource(R {
            logic_ref: Digest::from_bytes(&b64.decode(logic_ref)?)?.0,
            label_ref: Digest::from_bytes(&b64.decode(label_ref)?)?.0,
            value_ref: Digest::from_bytes(&b64.decode(value_ref)?)?.0,
            nonce,
            rand_seed,
            nk_commitment: NKC::from_bytes(&b64.decode(nk_commitment)?)?,
            quantity: parse_quantity(quantity)?,
            is_ephemeral: *is_ephemeral,
        }))
    }

    pub fn commitment(&self) -> Digest {
        Digest(self.0.commitment())
    }

    pub fn nullifier(&self, nf_key: &NullifierKey) -> Result<Digest, BindingsError> {
        Ok(Digest(self.0.nullifier(&nf_key.0)?))
    }

    #[uniffi::constructor]
    pub fn from_bytes(bytes: &[u8]) -> Result<Resource, BindingsError> {
        Ok(Resource(R::from_bytes(bytes)?))
    }
}

/// Quantities are decimal strings because u128 cannot cross the FFI boundary.
#[derive(Debug, uniffi::Record)]
pub struct EncodedResource {
    pub is_ephemeral: bool,
    pub quantity: String,
    pub logic_ref: String,
    pub label_ref: String,
    pub value_ref: String,
    pub nonce: String,
    pub rand_seed: String,
    pub nk_commitment: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResourceWithLabelData {
    pub resource: R,
    pub forwarder: Vec<u8>,
    pub erc20_token_addr: Vec<u8>,
}

#[derive(Clone, Debug, Serialize, Deserialize, uniffi::Object)]
pub struct ResourceWithLabel(ResourceWithLabelData);

#[uniffi::export]
impl ResourceWithLabel {
    #[uniffi::constructor]
    pub fn from_encrypted(
        payload: Vec<u8>,
        sk_bytes: Vec<u8>,
    ) -> Result<ResourceWithLabel, BindingsError> {
        let ciphertext = Ciphertext::from_bytes(payload);
        let sk = SecretKey::from_bytes(sk_bytes)?;
        let plaintext_bytes = ciphertext.decrypt(&sk)?;
        let payload_plaintext: ResourceWithLabelData = bincode::deserialize(&plaintext_bytes)?;

        Ok(ResourceWithLabel(payload_plaintext))
    }

    /// Get resource instance
    pub fn resource(&self) -> Resource {
        Resource(self.0.resource)
    }

    /// Get forwarder as hex
    pub fn forwarder(&self) -> String {
        format!("0x{}", hex::encode(&self.0.forwarder))
    }

    /// Get erc20_token_addr as hex
    pub fn erc20_token_address(&self) -> String {
        format!("0x{}", hex::encode(&self.0.erc20_token_addr))
    }
}
