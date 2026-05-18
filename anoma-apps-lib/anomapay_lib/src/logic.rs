use anomapay_shared::types::{ConsumedPersistentProps, CreatePersistentProps};
use arm_risc0_bindings::arm::{
    authorization::{AuthoritySignature, AuthorityVerifyingKey},
    digest::Digest,
    encryption::PublicKey,
    nullifier_key::NullifierKey,
    resource::Resource,
};
use transfer_library::{TransferLogic as TL, TOKEN_TRANSFER_ID};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[wasm_bindgen]
pub struct TransferLogic(pub(crate) TL);

#[wasm_bindgen]
impl TransferLogic {
    #[wasm_bindgen(getter, js_name = "verifyingKey")]
    pub fn verifying_key() -> String {
        TOKEN_TRANSFER_ID.to_string()
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

        Ok(TransferLogic(TL::consume_persistent_resource_logic(
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

        Ok(Self(TL::create_persistent_resource_logic(
            resource,
            action_tree_root,
            discovery_pk.instance(),
            auth_pk,
            encryption_pk,
            forwarder_address,
            erc20_token_addr,
        )))
    }

    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(self) -> Result<String, JsError> {
        Ok(serde_json::to_string_pretty(&self.0)?)
    }
}

#[cfg(test)]
mod tests {
    use anomapay_shared::types::{ConsumedPersistentProps, ResourceProps};
    use arm_risc0_bindings::arm::resource::Resource;
    use wasm_bindgen_test::*;

    use crate::logic::TransferLogic;

    #[wasm_bindgen_test]
    fn _consumed_logic() {
        let empty_resource = Resource::empty();
        let hex_string = "deadbeef".to_string();

        let props = ConsumedPersistentProps {
            resource: ResourceProps {
                is_ephemeral: false,
                quantity: 1,
                logic_ref: hex_string.clone(),
                label_ref: hex_string.clone(),
                value_ref: hex_string.clone(),
                nonce: hex_string.clone(),
                rand_seed: hex_string.clone(),
                nk_commitment: hex_string.clone(),
            },
            action_tree_root: hex_string.clone(),
            nf_key: hex_string.clone(),
            auth_pk: hex_string.clone(),
            encryption_pk: hex_string.clone(),
            auth_sig: hex_string.clone(),
        };

        let consumed_persistent_resource_logic =
            TransferLogic::consume_persistent_resource_logic(props)
                .expect("Could not instantiate TransferLogic");
        let json = consumed_persistent_resource_logic
            .to_json()
            .expect("Serialization to JSON should not fail!");

        assert_eq!(json, "test");
    }

    #[wasm_bindgen_test]
    fn fail() {
        assert_ne!(1, 2);
    }

    // On a target other then `wasm32-unknown-unknown`, the `#[test]` attribute
    // will be used instead, allowing this test to run on any target.
    #[wasm_bindgen_test(unsupported = test)]
    fn all_targets_fail() {
        assert_ne!(1, 2);
    }

    #[test]
    fn pass_non_wasm() {
        println!("Passing non-wasm test");
        let one = 1;
        let two = 2;

        assert_eq!(one, two - 1);
    }
}
