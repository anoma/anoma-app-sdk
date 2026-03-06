use alloy_sol_types::sol;
use wasm_bindgen::prelude::wasm_bindgen;

sol! {
    #[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
    enum CallType {
        Wrap,
        Unwrap,
        Migrate
    }
}

#[wasm_bindgen(js_name = "CallType")]
#[derive(Debug)]
pub struct CallTypeJs(pub(crate) CallType);

impl CallTypeJs {
    pub fn instance(&self) -> &CallType {
        &self.0
    }
}

#[wasm_bindgen(js_class = "CallType")]
impl CallTypeJs {
    #[wasm_bindgen(js_name = "toVec")]
    pub fn to_vec(&self) -> Vec<u8> {
        vec![*self.instance() as u8]
    }

    #[wasm_bindgen(getter, js_name = "Wrap")]
    pub fn wrap() -> CallTypeJs {
        CallTypeJs(CallType::Wrap)
    }

    #[wasm_bindgen(getter, js_name = "Unwrap")]
    pub fn unwrap() -> CallTypeJs {
        CallTypeJs(CallType::Unwrap)
    }

    #[wasm_bindgen(getter, js_name = "Migrate")]
    pub fn migrate() -> CallTypeJs {
        CallTypeJs(CallType::Migrate)
    }
}
