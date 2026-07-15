use arm::utils;

use crate::arm::digest::Digest;

/// Bind reusable utils from arm-risc0

#[uniffi::export]
pub fn hash_bytes(bytes: &[u8]) -> Digest {
    Digest(utils::hash_bytes(bytes))
}

#[uniffi::export]
pub fn hash_two(left: &Digest, right: &Digest) -> Digest {
    Digest(utils::hash_two(&left.0, &right.0))
}

#[uniffi::export]
pub fn bytes_to_words(bytes: &[u8]) -> Vec<u32> {
    utils::bytes_to_words(bytes)
}

#[uniffi::export]
pub fn words_to_bytes(words: &[u32]) -> Vec<u8> {
    utils::words_to_bytes(words).to_vec()
}
