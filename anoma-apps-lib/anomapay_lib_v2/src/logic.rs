use anomapay_shared::types::{ConsumedPersistentProps, CreatePersistentProps};
use arm_risc0_bindings::arm::{
    authorization::{AuthoritySignature, AuthorityVerifyingKey},
    digest::Digest,
    encryption::PublicKey,
    nullifier_key::NullifierKey,
    resource::Resource,
};
use transfer_library_v2::{TransferLogicV2 as TLV2, TOKEN_TRANSFER_V2_ID};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

use crate::types::MigrateResourceLogicProps;

#[wasm_bindgen]
pub struct TransferLogicV2(pub(crate) TLV2);

#[wasm_bindgen]
impl TransferLogicV2 {
    #[wasm_bindgen(getter, js_name = "verifyingKey")]
    pub fn verifying_key() -> String {
        TOKEN_TRANSFER_V2_ID.to_string()
    }

    /// Creates resource logic for a consumed persistent resource.
    #[wasm_bindgen(js_name = "consumePersistentResourceLogic")]
    pub fn consume_persistent_resource_logic(
        props: ConsumedPersistentProps,
    ) -> Result<Self, JsError> {
        let ConsumedPersistentProps {
            resource,
            action_tree_root,
            nf_key,
            auth_pk,
            encryption_pk,
            auth_sig,
        } = props;

        let resource = *Resource::new(resource)?.instance();
        let action_tree_root = *Digest::from_hex(&action_tree_root)?.instance();
        let nf_key = NullifierKey::from_base64(&nf_key)?.instance().clone();
        let auth_pk = *AuthorityVerifyingKey::from_base64(&auth_pk)?.instance();
        let encryption_pk = *PublicKey::from_base64(&encryption_pk)?.instance();
        let auth_sig = *AuthoritySignature::from_base64(&auth_sig)?.instance();

        Ok(TransferLogicV2(TLV2::consume_persistent_resource_logic(
            resource,
            action_tree_root,
            nf_key,
            auth_pk,
            encryption_pk,
            auth_sig,
        )))
    }

    /// Creates resource logic for a created persistent resource.
    pub fn create_persistent_resource_logic(props: CreatePersistentProps) -> Result<Self, JsError> {
        let CreatePersistentProps {
            resource,
            action_tree_root,
            discovery_pk,
            auth_pk,
            encryption_pk,
            forwarder_address,
            erc20_token_addr,
        } = props;

        let resource = *Resource::new(resource)?.instance();
        let action_tree_root = *Digest::from_hex(&action_tree_root)?.instance();
        let discovery_pk = PublicKey::from_base64(&discovery_pk)?;
        let auth_pk = *AuthorityVerifyingKey::from_base64(&auth_pk)?.instance();
        let encryption_pk = *PublicKey::from_base64(&encryption_pk)?.instance();
        let forwarder_address = hex::decode(&forwarder_address)?;
        let erc20_token_addr = hex::decode(&erc20_token_addr)?;

        Ok(Self(TLV2::create_persistent_resource_logic(
            resource,
            action_tree_root,
            discovery_pk.instance(),
            auth_pk,
            encryption_pk,
            forwarder_address,
            erc20_token_addr,
        )))
    }

    #[wasm_bindgen(js_name = "migrateResourceLogic")]
    pub fn migrate_resource_logic(props: MigrateResourceLogicProps) -> Result<Self, JsError> {
        let MigrateResourceLogicProps {
            .. // REMOVE!
            // resource,
            // // Hex string encoded
            // action_tree_root,
            // forwarder_addr,
            // erc20_token_addr,
            // // Base64 string encoded
            // nf_key,
            // migrated_resource,
            // migrated_nf_key,
            // migrated_resource_path,
            // migrated_auth_pk,
            // migrated_encryption_pk,
            // migrated_auth_sig,
            // migrated_forwarder_addr,
        } = props;

        // ORDER OF ARGS OMG:

        // self_resource: Resource,
        // action_tree_root: Digest,
        // self_nf_key: NullifierKey,
        // self_forwarder_addr: Vec<u8>,
        // enc20_token_addr: Vec<u8>,
        // mngrated_resource: Resource,
        // migrated_nf_key: NullifierKey,
        // migrated_resource_path: MerklePath,
        // migrated_auth_pk: AuthorityVerifyingKey,
        // migrated_encryption_pk: AffinePoint,
        // migrated_auth_sig: AuthoritySignature,
        // forwarder address v1
        // migrated_forwarder_addr: Vec<u8>,

        todo!();
        // Ok(Self(TLV2::migrate_resource_logic(
        //     *Resource::new(resource)?.instance(),
        //     *Digest::from_hex(&action_tree_root)?.instance(),
        //     *NullifierKey::from_base64(&nf_key)?.instance(),
        //     hex::decode(&forwarder_address)?,
        //     hex::decode(&erc20_token_addr)?,
        //     *Resource::new(migrated_resource)?.instance(),
        //     *NullifierKey::from_base64(&migrated_nf_key)?.instance(),
        //     MerklePath::new(), // ...
        // )))
    }
    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(self) -> Result<String, JsError> {
        Ok(serde_json::to_string_pretty(&self.0)?)
    }
}
