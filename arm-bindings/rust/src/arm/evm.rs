use alloy_sol_types::sol;

mod sol_types {
    use super::sol;

    sol! {
        #[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
        enum CallType {
            Wrap,
            Unwrap
        }
    }
}

pub use sol_types::CallType as SolCallType;

#[derive(Debug, Clone, Copy, uniffi::Enum)]
pub enum CallType {
    Wrap,
    Unwrap,
}

impl CallType {
    pub fn instance(&self) -> SolCallType {
        match self {
            CallType::Wrap => SolCallType::Wrap,
            CallType::Unwrap => SolCallType::Unwrap,
        }
    }
}

#[uniffi::export]
pub fn call_type_to_vec(call_type: CallType) -> Vec<u8> {
    vec![call_type.instance() as u8]
}
