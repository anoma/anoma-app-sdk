use crate::error::BindingsError;
use hex::FromHex;
use risc0_zkvm::Digest as D;
use serde::{self, Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, uniffi::Object)]
pub struct Digest(pub(crate) D);

impl Digest {
    pub fn instance(&self) -> &D {
        &self.0
    }
}

#[uniffi::export]
impl Digest {
    #[uniffi::constructor]
    pub fn new(bytes: &[u8]) -> Result<Digest, BindingsError> {
        let bytes: [u8; 32] = bytes.try_into()?;
        Ok(Digest(D::from_bytes(bytes)))
    }

    #[uniffi::constructor]
    pub fn from_bytes(bytes: &[u8]) -> Result<Digest, BindingsError> {
        Digest::new(bytes)
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.as_bytes().to_vec()
    }

    pub fn to_hex(&self) -> String {
        hex::encode(self.to_bytes())
    }

    #[uniffi::constructor]
    pub fn from_hex(hex: &str) -> Result<Digest, BindingsError> {
        Ok(Digest(D::from_hex(hex).map_err(|e| {
            BindingsError::new(format!("Invalid hex: {}", e))
        })?))
    }

    #[allow(clippy::should_implement_trait)]
    #[uniffi::constructor]
    pub fn default() -> Digest {
        Digest(D::default())
    }
}
