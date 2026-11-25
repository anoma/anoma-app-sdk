use crate::arm::digest::Digest;
use crate::error::BindingsError;
use arm::action_tree::ActionTree as AT;
use std::sync::Arc;

#[derive(Debug, uniffi::Object)]
pub struct ActionTree(pub(crate) AT);

impl ActionTree {
    pub fn instance(&self) -> &AT {
        &self.0
    }
}

#[uniffi::export]
impl ActionTree {
    #[uniffi::constructor]
    pub fn new(leaves: Vec<Arc<Digest>>) -> Self {
        ActionTree(AT::new(leaves.iter().map(|d| d.0).collect()))
    }

    pub fn root(&self) -> Result<Digest, BindingsError> {
        Ok(Digest(self.instance().root()?))
    }

    /// Returns hex string representing the actionTreeRoot bytes needed for
    /// Permit2 signing.
    pub fn to_witness(&self) -> Result<String, BindingsError> {
        let bytes = &self.root()?.to_bytes();
        Ok(format!("0x{}", hex::encode(bytes)))
    }
}
