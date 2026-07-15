use arm::nullifier_key::{NullifierKey as NK, NullifierKeyCommitment as NKCommitment};
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use serde::{self, Deserialize, Serialize};

use crate::arm::digest::Digest;
use crate::error::BindingsError;

#[derive(Clone, Serialize, Deserialize, uniffi::Object)]
pub struct NullifierKey(pub(crate) NK);

impl NullifierKey {
    pub fn instance(&self) -> &NK {
        &self.0
    }
}

#[uniffi::export]
impl NullifierKey {
    #[uniffi::constructor]
    pub fn new(nk_bytes: &[u8]) -> Result<NullifierKey, BindingsError> {
        let bytes: [u8; 32] = nk_bytes.try_into()?;
        Ok(NullifierKey(NK::from_bytes(bytes)))
    }

    pub fn commit(&self) -> NullifierKeyCommitment {
        NullifierKeyCommitment(self.0.commit())
    }

    pub fn inner(&self) -> Vec<u8> {
        self.0.inner().to_vec()
    }

    pub fn to_base64(&self) -> String {
        b64.encode(self.inner())
    }

    #[uniffi::constructor]
    pub fn from_base64(encoded: &str) -> Result<NullifierKey, BindingsError> {
        NullifierKey::new(&b64.decode(encoded)?)
    }

    #[allow(clippy::should_implement_trait)]
    #[uniffi::constructor]
    pub fn default() -> NullifierKey {
        NullifierKey(NK::default())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, uniffi::Object)]
pub struct NullifierKeyCommitment(pub(crate) NKCommitment);

impl NullifierKeyCommitment {
    pub fn instance(&self) -> NKCommitment {
        self.0
    }
}

#[uniffi::export]
impl NullifierKeyCommitment {
    #[uniffi::constructor]
    pub fn new(nk_cmt_bytes: &[u8]) -> Result<NullifierKeyCommitment, BindingsError> {
        Ok(NullifierKeyCommitment(NKCommitment::from_bytes(
            nk_cmt_bytes,
        )?))
    }

    pub fn inner(&self) -> Digest {
        Digest(self.0.inner())
    }

    pub fn to_base64(&self) -> String {
        b64.encode(self.inner().to_bytes())
    }

    #[uniffi::constructor]
    pub fn from_base64(encoded: &str) -> Result<NullifierKeyCommitment, BindingsError> {
        NullifierKeyCommitment::new(&b64.decode(encoded)?)
    }
}

#[derive(Clone, Serialize, Deserialize, uniffi::Object)]
pub struct NullifierKeyPair {
    pub nk: NullifierKey,
    pub cnk: NullifierKeyCommitment,
}

#[uniffi::export]
impl NullifierKeyPair {
    #[uniffi::constructor]
    pub fn new(nk: &NullifierKey, cnk: &NullifierKeyCommitment) -> NullifierKeyPair {
        NullifierKeyPair {
            nk: nk.clone(),
            cnk: cnk.clone(),
        }
    }

    #[uniffi::constructor]
    pub fn random() -> NullifierKeyPair {
        let (nk, cnk) = NK::random_pair();

        NullifierKeyPair {
            nk: NullifierKey(nk),
            cnk: NullifierKeyCommitment(cnk),
        }
    }

    pub fn nk(&self) -> NullifierKey {
        self.nk.clone()
    }

    pub fn cnk(&self) -> NullifierKeyCommitment {
        self.cnk.clone()
    }

    pub fn to_json(&self) -> Result<String, BindingsError> {
        Ok(serde_json::to_string(&self)?)
    }

    #[uniffi::constructor]
    pub fn from_json(json: &str) -> Result<NullifierKeyPair, BindingsError> {
        Ok(serde_json::from_str(json)?)
    }

    pub fn encode(&self) -> EncodedNullifierKeyPair {
        EncodedNullifierKeyPair {
            nk: self.nk.to_base64(),
            cnk: self.cnk.to_base64(),
        }
    }

    #[uniffi::constructor]
    pub fn decode(encoded: EncodedNullifierKeyPair) -> Result<NullifierKeyPair, BindingsError> {
        Ok(NullifierKeyPair {
            nk: NullifierKey::from_base64(&encoded.nk)?,
            cnk: NullifierKeyCommitment::from_base64(&encoded.cnk)?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, uniffi::Record)]
pub struct EncodedNullifierKeyPair {
    pub nk: String,
    pub cnk: String,
}
