use arm::compliance::INITIAL_ROOT;
use arm::utils::words_to_bytes;

#[uniffi::export]
pub fn initial_root_bytes() -> Vec<u8> {
    words_to_bytes(INITIAL_ROOT.as_words()).to_vec()
}
