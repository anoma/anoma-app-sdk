use arm::utils::words_to_bytes;
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use k256::{AffinePoint, elliptic_curve::group::GroupEncoding};

/// Constants copied directly from backend
pub const HELIAX_FEE_LOGIC_REF: [u32; 8] = [0u32; 8];
pub const HELIAX_FEE_LABEL_REF_WETH: [u32; 8] = [1u32; 8];
pub const HELIAX_FEE_LABEL_REF_USDC: [u32; 8] = [11u32; 8];
pub const HELIAX_FEE_LABEL_REF_XAN: [u32; 8] = [111u32; 8];
pub const HELIAX_FEE_VALUE_REF: [u32; 8] = [2u32; 8];
pub const HELIAX_FEE_NULLIFIER_KEY_COMMITMENT: [u32; 8] = [3u32; 8];
pub const HELIAX_FEE_DISCOVERY_PK: AffinePoint = AffinePoint::GENERATOR;
pub const HELIAX_FEE_ENCRYPTION_PK: AffinePoint = AffinePoint::GENERATOR;

// Accessors to these constants encoded as expected on frontend

#[uniffi::export]
pub fn heliax_fee_logic_ref() -> String {
    hex::encode(words_to_bytes(&HELIAX_FEE_LOGIC_REF))
}

#[uniffi::export]
pub fn heliax_fee_label_ref_weth() -> String {
    hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_WETH))
}

#[uniffi::export]
pub fn heliax_fee_label_ref_usdc() -> String {
    hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_USDC))
}

#[uniffi::export]
pub fn heliax_fee_label_ref_xan() -> String {
    hex::encode(words_to_bytes(&HELIAX_FEE_LABEL_REF_XAN))
}

#[uniffi::export]
pub fn heliax_fee_value_ref() -> String {
    hex::encode(words_to_bytes(&HELIAX_FEE_VALUE_REF))
}

#[uniffi::export]
pub fn heliax_fee_nullifier_key_commitment() -> String {
    b64.encode(words_to_bytes(&HELIAX_FEE_NULLIFIER_KEY_COMMITMENT))
}

#[uniffi::export]
pub fn heliax_fee_discovery_pk() -> String {
    hex::encode(HELIAX_FEE_DISCOVERY_PK.to_bytes())
}

#[uniffi::export]
pub fn heliax_fee_encryption_pk() -> String {
    hex::encode(HELIAX_FEE_ENCRYPTION_PK.to_bytes())
}
