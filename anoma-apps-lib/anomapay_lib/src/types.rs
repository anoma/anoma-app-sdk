use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::wasm_bindgen;

/// JavaScript-facing prop definitions

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct CreatePersistentResourceProps {
    pub forwarder_address: String,
    pub erc20_token_addr: String,
    pub encryption_pk: String,
    pub nf_key: String,
    pub quantity: u128,
    pub auth_pk: String,
}

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct CreateEphemeralResourceProps {
    pub forwarder_address: String,
    pub erc20_token_addr: String,
    pub ethereum_account_addr: String,
    pub nf_key: String,
    pub quantity: u128,
}
