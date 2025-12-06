use arm::action_tree::MerkleTree as MT;

#[cfg(feature = "wasm")]
use crate::arm::digest::Digest;
#[cfg(feature = "wasm")]
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Debug)]
pub struct MerkleTree(pub(crate) MT);

impl MerkleTree {
    pub fn instance(&self) -> &MT {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl MerkleTree {
    #[wasm_bindgen(constructor)]
    pub fn new(leaves: Vec<Digest>) -> Self {
        MerkleTree(MT::new(leaves.iter().map(|d| d.0).collect()))
    }

    pub fn root(&self) -> Result<Digest, JsError> {
        Ok(Digest(self.instance().root()?))
    }

    /// Returns hex string representing the actionTreeRoot bytes needed for
    /// Permit2 signing. This is only available in a browser wasm target.
    #[wasm_bindgen(js_name = "toWitness")]
    pub fn to_witness(&self) -> Result<String, JsError> {
        let bytes = &self.root()?.to_bytes();
        Ok(format!("0x{}", &hex::encode(bytes)))
    }
}
