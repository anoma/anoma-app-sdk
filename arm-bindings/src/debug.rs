use console_error_panic_hook;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(start)]
pub fn on_start() {
    std::panic::set_hook(Box::new(|p| {
        console_error_panic_hook::hook(p);
    }));
}
