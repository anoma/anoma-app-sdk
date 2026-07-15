uniffi::setup_scaffolding!();

pub mod arm;
pub mod constants;
pub mod error;
pub mod utils;

pub use arm as arm_risc0;
pub use bincode;
pub use k256;
pub use risc0_zkvm;
pub use serde;

/// Toolchain smoke test; removed once real bindings land.
#[uniffi::export]
pub fn ping() -> String {
    "pong from rust 2".to_string()
}
