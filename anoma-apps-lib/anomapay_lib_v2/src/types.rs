use anomapay_shared::types::ResourceProps;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateResourceLogicProps {
    pub resource: MigrateResourceProps,
    pub migrated_resource: MigrateMigratedResourceProps,
    pub consumed: MigrateConsumedResourceProps,
}

/// JavaScript-facing prop definitions for V2 migration only
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateResourceProps {
    pub resource: ResourceProps,
    pub migrated_resource: ResourceProps,
    // Hex string encoded
    pub action_tree_root: String,
    pub forwarder_addr: String,
    pub erc20_token_addr: String,
    // Base64 string encoded
    pub nf_key: String,
}

// // Parameters for the consumed resource
// consumed_resource: Resource,
// latest_cm_tree_root: Digest,
// consumed_nf_key: NullifierKey,
// forwarder_addr: Vec<u8>,
// erc20_token_addr: Vec<u8>,
//
// // Parameters for migrated resource via forwarder
// migrated_resource: Resource,
// migrated_nf_key: NullifierKey,
// migrated_resource_path: MerklePath,
// migrated_auth_pk: AuthorityVerifyingKey,
// migrated_encryption_pk: AffinePoint,
// migrated_auth_sig: AuthoritySignature,
// migrated_forwarder_addr: Vec<u8>,

// // Parameters for the created resource
// created_resource: Resource,
// created_discovery_pk: AffinePoint,
// created_auth_pk: AuthorityVerifyingKey,
// created_encryption_pk: AffinePoint,

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateCreatedResourceProps {
    pub resource: ResourceProps,
    pub discovery_pk: String,
    pub auth_pk: String,
    pub encryption_pk: String,
    pub nf_key: String,
}

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateConsumedResourceProps {
    pub resource: ResourceProps,
    pub migrated_resource: ResourceProps,
    // Hex string encoded
    pub action_tree_root: String,
    pub forwarder_addr: String,
    pub erc20_token_addr: String,
    // Base64 string encoded
    pub nf_key: String,
}

#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct MigrateMigratedResourceProps {
    pub nf_key: String,
    pub resource_path: String,
    pub auth_pk: String,
    pub encryption_pk: String,
    pub auth_sig: String,
    pub forwarder_addr: String,
}
