use arm::{Digest as D, merkle_path::MerklePath as MP};

use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use serde::{self, Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct MerklePath(pub(crate) MP);

impl MerklePath {
    pub fn instance(&self) -> &MP {
        &self.0
    }

    pub fn inner(&self) -> &Vec<(D, bool)> {
        &self.instance().0
    }
}

#[wasm_bindgen]
impl MerklePath {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        MerklePath::default()
    }

    // Encode to format expected by Anoma SDK
    pub fn encode(&self) -> EncodedMerklePath {
        let leaves: Vec<EncodedMerkleLeaf> = self
            .inner()
            .iter()
            .map(|(node, left)| EncodedMerkleLeaf {
                node: b64.encode(node.as_bytes()),
                left: *left,
            })
            .collect();
        EncodedMerklePath(leaves)
    }
}

#[allow(clippy::derivable_impls)]
impl Default for MerklePath {
    fn default() -> Self {
        MerklePath(MP::default())
    }
}

/// Define encoded MerklePath leaf for interacting with Anoma SDK encoding
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EncodedMerkleLeaf {
    pub node: String,
    pub left: bool,
}

/// Define encoded MerklePath for interacting with Anoma SDK encoding
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EncodedMerklePath(pub(crate) Vec<EncodedMerkleLeaf>);
