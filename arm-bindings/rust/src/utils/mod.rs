use crate::error::BindingsError;

const DEFAULT_BYTES: usize = 32;

/// Counter value is a decimal string because u128 cannot cross the FFI boundary.
#[uniffi::export]
pub fn convert_counter_to_value_ref(value: String) -> Result<Vec<u8>, BindingsError> {
    let value = value
        .parse::<u128>()
        .map_err(|e| BindingsError::new(format!("Invalid counter value: {}", e)))?;
    let mut arr = [0u8; DEFAULT_BYTES];
    let bytes = value.to_le_bytes();
    arr[..16].copy_from_slice(&bytes); // left-align, right-pad with 0
    Ok(arr.to_vec())
}

/// Return a 32-byte randome vec
#[uniffi::export]
pub fn random_bytes() -> Vec<u8> {
    let mut bytes = [0u8; DEFAULT_BYTES];
    getrandom::fill(&mut bytes).expect("Failed to fill buffer");
    bytes.to_vec()
}
