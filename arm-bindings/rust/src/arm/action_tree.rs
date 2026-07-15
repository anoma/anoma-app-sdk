use crate::arm::digest::Digest;
use crate::error::BindingsError;
use arm::action_tree::MerkleTree as MT;
use std::sync::Arc;

#[derive(Debug, uniffi::Object)]
pub struct MerkleTree(pub(crate) MT);

impl MerkleTree {
    pub fn instance(&self) -> &MT {
        &self.0
    }
}

#[uniffi::export]
impl MerkleTree {
    #[uniffi::constructor]
    pub fn new(leaves: Vec<Arc<Digest>>) -> Self {
        MerkleTree(MT::new(leaves.iter().map(|d| d.0).collect()))
    }

    pub fn root(&self) -> Result<Digest, BindingsError> {
        Ok(Digest(self.instance().root()?))
    }

    /// Returns hex string representing the actionTreeRoot bytes needed for
    /// Permit2 signing.
    pub fn to_witness(&self) -> Result<String, BindingsError> {
        let bytes = &self.root()?.to_bytes();
        Ok(format!("0x{}", &hex::encode(bytes)))
    }
}
