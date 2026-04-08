use transfer_library_v2::TransferLogicV2;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct ResourceBuilder {
    logic: TransferLogicV2,
}

impl ResourceBuilder {
    pub fn new() -> Self {
        todo!("Implement me!")
    }
}
