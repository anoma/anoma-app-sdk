use transfer_library::TransferLogic;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct ResourceBuilder {
    logic: TransferLogic,
}

impl ResourceBuilder {
    pub fn new() -> Self {
        todo!("Implement me!")
    }
}
