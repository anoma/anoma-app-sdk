use anomapay_shared::types::{ConsumedPersistentProps, CreatePersistentProps};
use arm_risc0_bindings::arm::{
    authorization::{AuthoritySignature, AuthorityVerifyingKey},
    digest::Digest,
    encryption::PublicKey,
    nullifier_key::NullifierKey,
    resource::{EncodedResource, Resource},
};
use transfer_library::{TOKEN_TRANSFER_ID, TransferLogic as TL};
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[wasm_bindgen]
pub struct TransferLogic(pub(crate) TL);

#[wasm_bindgen]
impl TransferLogic {
    #[wasm_bindgen(getter, js_name = "verifyingKey")]
    pub fn verifying_key() -> String {
        TOKEN_TRANSFER_ID.to_string()
    }

    /// Creates resource logic for a created resource.
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

        Ok(Self(TL::create_persistent_resource_logic(
            *Resource::new(resource)?.instance(),
            *Digest::from_hex(&action_tree_root)?.instance(),
            PublicKey::from_base64(&discovery_pk)?.instance(),
            *AuthorityVerifyingKey::from_base64(&auth_pk)?.instance(),
            *PublicKey::from_base64(&encryption_pk)?.instance(),
            hex::decode(&forwarder_address)?,
            hex::decode(&erc20_token_addr)?,
        )))
    }

    /// TODO: REMOVE FYI Just messing around, in case I forget to remove
    /// We need method to return a JS-Object representation of the struct's
    /// data once new() is called, resource, wtiness, etc.
    #[wasm_bindgen(getter)]
    pub fn resource(self) -> EncodedResource {
        Resource::from_resource(self.0.witness.resource).encode()
    }

    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(self) -> Result<String, JsError> {
        Ok(serde_json::to_string_pretty(&self.0)?)
    }
}
