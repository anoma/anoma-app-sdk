use hex::FromHex;
use risc0_zkvm::Digest as D;
use serde::{self, Deserialize, Serialize};
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[wasm_bindgen]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Digest(pub(crate) D);

impl Digest {
    pub fn instance(&self) -> &D {
        &self.0
    }
}

#[wasm_bindgen]
impl Digest {
    #[wasm_bindgen(constructor)]
    pub fn new(bytes: &[u8]) -> Result<Digest, JsError> {
        let bytes: [u8; 32] = bytes.try_into()?;
        Ok(Digest(D::from_bytes(bytes)))
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Digest, JsError> {
        Digest::new(bytes)
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.as_bytes().to_vec()
    }

    #[wasm_bindgen(js_name = "toHex")]
    pub fn to_hex(&self) -> String {
        hex::encode(self.to_bytes())
    }

    #[wasm_bindgen(js_name = "fromHex")]
    pub fn from_hex(hex: &str) -> Result<Digest, JsError> {
        Ok(Digest(D::from_hex(hex).map_err(|e| {
            JsError::new(&format!("Invalid hex: {}", e))
        })?))
    }

    #[allow(clippy::should_implement_trait)]
    pub fn default() -> Digest {
        Digest(D::default())
    }
}
