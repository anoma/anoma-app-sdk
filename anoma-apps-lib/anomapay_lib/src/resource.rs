use crate::logic::TransferLogic;
use anomapay_shared::types::{
    CreateEphemeralResourceProps, CreatePersistentResourceProps, ResourceProps,
};
use arm_risc0_bindings::arm::{
    authorization::AuthorityVerifyingKey,
    digest::Digest,
    encryption::PublicKey,
    nullifier_key::NullifierKey,
    resource::{EncodedResource, Resource},
};
use serde::{Deserialize, Serialize};
use transfer_witness::{
    calculate_label_ref, calculate_persistent_value_ref,
    calculate_value_ref_from_ethereum_account_addr, ValueInfo,
};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[wasm_bindgen]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResourceBuilder(Resource);

#[wasm_bindgen]
impl ResourceBuilder {
    #[wasm_bindgen(constructor)]
    pub fn new(props: ResourceProps) -> Result<Self, JsError> {
        let ResourceProps {
            is_ephemeral,
            quantity,
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
        } = props;

        Ok(ResourceBuilder(Resource::decode(&EncodedResource {
            is_ephemeral,
            quantity,
            logic_ref,
            label_ref,
            value_ref,
            nonce,
            rand_seed,
            nk_commitment,
        })?))
    }

    pub fn create_ephemeral_resource(
        props: CreateEphemeralResourceProps,
    ) -> Result<ResourceBuilder, JsError> {
        let CreateEphemeralResourceProps {
            forwarder_address,
            erc20_token_addr,
            ethereum_account_addr,
            quantity,
            nf_key,
        } = props;

        let label_ref =
            calculate_label_ref(forwarder_address.as_bytes(), erc20_token_addr.as_bytes());
        let value_ref =
            calculate_value_ref_from_ethereum_account_addr(ethereum_account_addr.as_bytes());
        let nk_commitment = NullifierKey::from_base64(&nf_key)?.commit();
        let EncodedResource { nonce, .. } = Resource::empty().encode();

        Ok(ResourceBuilder(Resource::create(
            &Digest::from_hex(&TransferLogic::verifying_key())?,
            &Digest::new(label_ref.as_bytes())?,
            quantity,
            &Digest::new(value_ref.as_bytes())?,
            true,
            &Digest::new(nonce.as_bytes())?,
            &nk_commitment,
        )))
    }

    pub fn create_persistent_resource(
        props: CreatePersistentResourceProps,
    ) -> Result<Self, JsError> {
        let CreatePersistentResourceProps {
            auth_pk,
            encryption_pk,
            nf_key,
            quantity,
            forwarder_address,
            erc20_token_addr,
        } = props;

        let label_ref =
            calculate_label_ref(forwarder_address.as_bytes(), erc20_token_addr.as_bytes());
        let nk_commitment = NullifierKey::from_base64(&nf_key)?.commit();
        let auth_pk = *AuthorityVerifyingKey::from_base64(&auth_pk)?.instance();
        let encryption_pk = *PublicKey::from_base64(&encryption_pk)?.instance();
        let value_info = ValueInfo {
            auth_pk,
            encryption_pk,
        };
        let value_ref = calculate_persistent_value_ref(&value_info);
        let is_ephemeral = false;

        let EncodedResource {
            nonce, rand_seed, ..
        } = Resource::empty().encode();

        ResourceBuilder::new(ResourceProps {
            is_ephemeral,
            quantity,
            logic_ref: TransferLogic::verifying_key(),
            label_ref: Digest::new(label_ref.as_bytes())?.to_hex(),
            value_ref: Digest::new(value_ref.as_bytes())?.to_hex(),
            rand_seed,
            nonce,
            nk_commitment: nk_commitment.to_base64(),
        })
    }

    #[wasm_bindgen(getter, js_name = "resource")]
    pub fn to_resource(&self) -> EncodedResource {
        self.0.encode()
    }

    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(&self) -> Result<String, JsError> {
        serde_json::to_string_pretty(&self.0).map_err(|e| JsError::new(&e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use crate::logic::TransferLogic;
    use arm_risc0_bindings::arm::{digest::Digest, resource::Resource};
    use rstest::{fixture, rstest};
    use serde::{Deserialize, Serialize};
    use wasm_bindgen_test::*;

    #[derive(Serialize, Deserialize)]
    struct ResourceTestData {
        ephemeral_resource: Resource,
        consumed_persistent_resource: Resource,
        created_resource: Resource,
    }

    #[fixture]
    fn resource_data() -> ResourceTestData {
        // // NOTE: fs only works on `cargo test`, fs does not exist in wasm
        let consumed_persistent_resource = Resource::empty();
        let created_resource = Resource::empty();
        let ephemeral_resource = Resource::empty();

        consumed_persistent_resource.instance().to_owned().logic_ref =
            Digest::from_hex(&TransferLogic::verifying_key())
                .unwrap()
                .instance()
                .to_owned();
        created_resource.instance().to_owned().logic_ref =
            Digest::from_hex(&TransferLogic::verifying_key())
                .unwrap()
                .instance()
                .to_owned();
        ephemeral_resource.instance().to_owned().logic_ref =
            Digest::from_hex(&TransferLogic::verifying_key())
                .unwrap()
                .instance()
                .to_owned();
        ephemeral_resource.instance().to_owned().is_ephemeral = true;

        ResourceTestData {
            consumed_persistent_resource,
            created_resource,
            ephemeral_resource,
        }
    }

    #[rstest]
    #[wasm_bindgen_test(unsupported = test)]
    fn test_with_fixture(resource_data: ResourceTestData) {
        let ResourceTestData {
            ephemeral_resource: _,
            consumed_persistent_resource: _,
            created_resource,
        } = resource_data;
        // assert_eq!(
        //     created_resource.instance().logic_ref,
        //     *Digest::from_hex(&TransferLogic::verifying_key())
        //         .unwrap()
        //         .instance()
        // );
    }
}
