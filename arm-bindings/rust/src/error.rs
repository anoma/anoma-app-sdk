use thiserror::Error;

/// Crate-wide FFI error. Flat: only the message crosses the boundary.
#[derive(Debug, Error, uniffi::Error)]
#[uniffi(flat_error)]
pub enum BindingsError {
    #[error("{msg}")]
    Generic { msg: String },
}

impl BindingsError {
    pub fn new(msg: impl Into<String>) -> Self {
        BindingsError::Generic { msg: msg.into() }
    }
}

macro_rules! impl_from_error {
    ($($t:ty),* $(,)?) => {$(
        impl From<$t> for BindingsError {
            fn from(e: $t) -> Self {
                BindingsError::new(e.to_string())
            }
        }
    )*};
}

impl_from_error!(
    std::array::TryFromSliceError,
    hex::FromHexError,
    base64::DecodeError,
    serde_json::Error,
    bincode::Error,
    arm::error::ArmError,
);
