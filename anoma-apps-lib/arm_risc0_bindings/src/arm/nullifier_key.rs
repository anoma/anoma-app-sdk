use arm::nullifier_key::{NullifierKey as NK, NullifierKeyCommitment as NKCommitment};
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use serde::{self, Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::{JsError, JsValue, prelude::wasm_bindgen};

use crate::arm::digest::Digest;

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct NullifierKey(pub(crate) NK);

impl NullifierKey {
    pub fn instance(&self) -> &NK {
        &self.0
    }
}

#[wasm_bindgen]
impl NullifierKey {
    #[wasm_bindgen(constructor)]
    pub fn new(nk_bytes: &[u8]) -> Result<NullifierKey, JsError> {
        let bytes: [u8; 32] = nk_bytes.try_into()?;
        Ok(NullifierKey(NK::from_bytes(bytes)))
    }

    pub fn commit(&self) -> NullifierKeyCommitment {
        NullifierKeyCommitment(self.0.commit())
    }

    pub fn inner(&self) -> Vec<u8> {
        self.0.inner().to_vec()
    }

    pub fn random() -> NullifierKeyPair {
        let (nk, cnk) = NK::random_pair();

        NullifierKeyPair {
            nk: NullifierKey(nk),
            cnk: NullifierKeyCommitment(cnk),
        }
    }

    #[wasm_bindgen(js_name = "toBase64")]
    pub fn to_base64(&self) -> String {
        b64.encode(self.inner())
    }

    #[wasm_bindgen(js_name = "fromBase64")]
    pub fn from_base64(encoded: &str) -> Result<NullifierKey, JsError> {
        NullifierKey::new(&b64.decode(encoded)?)
    }

    #[allow(clippy::should_implement_trait)]
    pub fn default() -> NullifierKey {
        NullifierKey(NK::default())
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NullifierKeyCommitment(pub(crate) NKCommitment);

impl NullifierKeyCommitment {
    pub fn instance(&self) -> NKCommitment {
        self.0
    }
}

#[wasm_bindgen]
impl NullifierKeyCommitment {
    #[wasm_bindgen(constructor)]
    pub fn new(nk_cmt_bytes: &[u8]) -> Result<NullifierKeyCommitment, JsError> {
        Ok(NullifierKeyCommitment(NKCommitment::from_bytes(
            nk_cmt_bytes,
        )?))
    }

    pub fn inner(&self) -> Digest {
        Digest(self.0.inner())
    }

    #[wasm_bindgen(js_name = "toBase64")]
    pub fn to_base64(&self) -> String {
        b64.encode(self.inner().to_bytes())
    }

    #[wasm_bindgen(js_name = "fromBase64")]
    pub fn from_base64(encoded: &str) -> Result<NullifierKeyCommitment, JsError> {
        NullifierKeyCommitment::new(&b64.decode(encoded)?)
    }
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct NullifierKeyPair {
    #[wasm_bindgen(getter_with_clone)]
    pub nk: NullifierKey,
    #[wasm_bindgen(getter_with_clone)]
    pub cnk: NullifierKeyCommitment,
}

#[wasm_bindgen]
impl NullifierKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(nk: NullifierKey, cnk: NullifierKeyCommitment) -> NullifierKeyPair {
        NullifierKeyPair { nk, cnk }
    }

    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(&self) -> Result<JsValue, JsError> {
        Ok(serde_wasm_bindgen::to_value(&self)?)
    }

    #[wasm_bindgen(js_name = "fromJson")]
    pub fn from_json(json: JsValue) -> Result<NullifierKeyPair, JsError> {
        Ok(serde_wasm_bindgen::from_value(json)?)
    }

    pub fn encode(&self) -> EncodedNullifierKeyPair {
        EncodedNullifierKeyPair {
            nk: self.nk.to_base64(),
            cnk: self.cnk.to_base64(),
        }
    }

    pub fn decode(encoded: &EncodedNullifierKeyPair) -> Result<NullifierKeyPair, JsError> {
        Ok(NullifierKeyPair {
            nk: NullifierKey::from_base64(&encoded.nk)?,
            cnk: NullifierKeyCommitment::from_base64(&encoded.cnk)?,
        })
    }
}

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EncodedNullifierKeyPair {
    pub nk: String,
    pub cnk: String,
}
