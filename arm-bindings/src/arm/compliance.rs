use arm::compliance::INITIAL_ROOT;
use arm::utils::words_to_bytes;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct InitialRoot {}

#[wasm_bindgen]
impl InitialRoot {
    pub fn bytes() -> Vec<u8> {
        words_to_bytes(INITIAL_ROOT.as_words()).to_vec()
    }
}
