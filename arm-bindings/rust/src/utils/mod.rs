use crate::error::BindingsError;

const DEFAULT_BYTES: usize = 32;

/// Return a 32-byte random vec
#[uniffi::export]
pub fn random_bytes() -> Result<Vec<u8>, BindingsError> {
    let mut bytes = [0u8; DEFAULT_BYTES];
    getrandom::fill(&mut bytes)?;
    Ok(bytes.to_vec())
}
