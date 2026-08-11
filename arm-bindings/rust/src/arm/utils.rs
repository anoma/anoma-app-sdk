use arm::utils;

use crate::arm::digest::Digest;

/// Bind reusable utils from arm-risc0

#[uniffi::export]
pub fn hash_bytes(bytes: &[u8]) -> Digest {
    Digest(utils::hash_bytes(bytes))
}
