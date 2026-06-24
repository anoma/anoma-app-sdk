use wasm_bindgen::prelude::wasm_bindgen;

const DEFAULT_BYTES: usize = 32;

#[wasm_bindgen(js_name = "convertCounterToValueRef")]
pub fn convert_counter_to_value_ref(value: u128) -> Vec<u8> {
    let mut arr = [0u8; DEFAULT_BYTES];
    let bytes = value.to_le_bytes();
    arr[..16].copy_from_slice(&bytes); // left-align, right-pad with 0
    arr.to_vec()
}

/// Return a 32-byte randome vec
#[wasm_bindgen(js_name = "randomBytes")]
pub fn random_bytes() -> Vec<u8> {
    let mut bytes = [0u8; DEFAULT_BYTES];
    getrandom::fill(&mut bytes).expect("Failed to fill buffer");
    bytes.to_vec()
}
