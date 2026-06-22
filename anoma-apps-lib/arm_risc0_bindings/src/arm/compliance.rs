use arm::compliance::INITIAL_ROOT;
use arm::utils::words_to_bytes;
use base64::{engine::general_purpose::STANDARD as b64, Engine as _};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct InitialRoot {}

#[wasm_bindgen]
impl InitialRoot {
    // Static INITIAL_ROOT bytes
    pub fn bytes() -> Vec<u8> {
        words_to_bytes(INITIAL_ROOT.as_words()).to_vec()
    }

    // Static INITIAL_ROOT base64 String
    pub fn base64() -> String {
        b64.encode(InitialRoot::bytes())
    }

    // Static INITIAL_ROOT hexdecimal String
    pub fn hex(&self) -> String {
        hex::encode(InitialRoot::bytes())
    }
}
