use arm::utils::words_to_bytes;
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use k256::{AffinePoint, elliptic_curve::group::GroupEncoding};
use wasm_bindgen::prelude::wasm_bindgen;

/// Constants copied directly from backend
pub const HELIAX_FEE_LOGIC_REF: [u32; 8] = [0u32; 8];
pub const HELIAX_FEE_LABEL_REF_WETH: [u32; 8] = [1u32; 8];
pub const HELIAX_FEE_LABEL_REF_USDC: [u32; 8] = [11u32; 8];
pub const HELIAX_FEE_LABEL_REF_XAN: [u32; 8] = [111u32; 8];
pub const HELIAX_FEE_VALUE_REF: [u32; 8] = [2u32; 8];
pub const HELIAX_FEE_NULLIFIER_KEY_COMMITMENT: [u32; 8] = [3u32; 8];
pub const HELIAX_FEE_DISCOVERY_PK: AffinePoint = AffinePoint::GENERATOR;
pub const HELIAX_FEE_ENCRYPTION_PK: AffinePoint = AffinePoint::GENERATOR;

// JS accessors to these constants encoded as expected on frontend
#[wasm_bindgen]
pub struct HeliaxKeys {}

#[allow(non_snake_case)]
#[wasm_bindgen]
impl HeliaxKeys {
    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_LOGIC_REF() -> String {
        hex::encode(words_to_bytes(&HELIAX_FEE_LOGIC_REF))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_LABEL_REF_WETH() -> String {
        hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_WETH))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_LABEL_REF_USDC() -> String {
        hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_USDC))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_LABEL_REF_XAN() -> String {
        hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_XAN))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_VALUE_REF() -> String {
        hex::encode(words_to_bytes(&HELIAX_FEE_VALUE_REF))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_NULLIFIER_KEY_COMMITMENT() -> String {
        b64.encode(words_to_bytes(&HELIAX_FEE_NULLIFIER_KEY_COMMITMENT))
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_DISCOVERY_PK() -> String {
        hex::encode(HELIAX_FEE_DISCOVERY_PK.to_bytes())
    }

    #[wasm_bindgen(getter)]
    pub fn HELIAX_FEE_ENCRYPTION_PK() -> String {
        hex::encode(HELIAX_FEE_ENCRYPTION_PK.to_bytes())
    }
}
