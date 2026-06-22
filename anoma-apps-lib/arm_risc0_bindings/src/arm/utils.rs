use arm::utils;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::arm::digest::Digest;

/// Bind reusable utils from arm-risc0

#[wasm_bindgen(js_name = "hashBytes")]
pub fn hash_bytes(bytes: &[u8]) -> Digest {
    Digest(utils::hash_bytes(bytes))
}

#[wasm_bindgen(js_name = "hashTwo")]
pub fn hash_two(left: &Digest, right: &Digest) -> Digest {
    Digest(utils::hash_two(&left.0, &right.0))
}

#[wasm_bindgen(js_name = "bytesToWords")]
pub fn bytes_to_words(bytes: &[u8]) -> Vec<u32> {
    utils::bytes_to_words(bytes)
}

#[wasm_bindgen(js_name = "wordsToBytes")]
pub fn words_to_bytes(words: &[u32]) -> Vec<u8> {
    utils::words_to_bytes(words).to_vec()
}
