use anomapay_shared::types::ResourceProps;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// JavaScript-facing prop definitions for V2 migration only
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateResourceLogicProps {
    pub resource: ResourceProps,
    pub migrated_resource: ResourceProps,
    // Hex string encoded
    pub action_tree_root: String,
    pub forwarder_addr: String,
    pub erc20_token_addr: String,
    // Base64 string encoded
    pub nf_key: String,
    pub migrated_nf_key: String,
    pub migrated_resource_path: String,
    pub migrated_auth_pk: String,
    pub migrated_encryption_pk: String,
    pub migrated_auth_sig: String,
    pub migrated_forwarder_addr: String,
}
