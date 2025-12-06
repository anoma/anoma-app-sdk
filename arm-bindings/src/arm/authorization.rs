use arm_gadgets::authorization::{
    AuthorizationSignature as AS, AuthorizationSigningKey as ASK, AuthorizationVerifyingKey as AVK,
};
use serde::{Deserialize, Serialize};

#[cfg(feature = "wasm")]
use crate::arm::action_tree::MerkleTree;
#[cfg(feature = "wasm")]
use k256::{ecdsa::Signature, elliptic_curve::sec1::ToEncodedPoint};
#[cfg(feature = "wasm")]
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone)]
pub struct AuthorizationSigningKey(pub(crate) ASK);

impl AuthorizationSigningKey {
    pub fn instance(&self) -> &ASK {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl AuthorizationSigningKey {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        AuthorizationSigningKey::default()
    }

    pub fn sign(&self, domain: &str, message: &[u8]) -> AuthorizationSignature {
        AuthorizationSignature(self.0.sign(domain.as_bytes(), message))
    }

    pub fn authorize(
        &self,
        domain: &str,
        action_tree: &MerkleTree,
    ) -> Result<AuthorizationSignature, JsError> {
        Ok(self.sign(domain, &action_tree.root()?.to_bytes()))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.instance().to_bytes().into()
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, JsError> {
        Ok(AuthorizationSigningKey(ASK::from_bytes(bytes)?))
    }
}

impl Default for AuthorizationSigningKey {
    fn default() -> Self {
        AuthorizationSigningKey(ASK::new())
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct AuthorizationSignature(AS);

impl AuthorizationSignature {
    pub fn instance(&self) -> &AS {
        &self.0
    }

    pub fn inner(&self) -> &Signature {
        self.instance().inner()
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl AuthorizationSignature {
    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.to_bytes().to_vec()
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, JsError> {
        Ok(AuthorizationSignature(AS::from_bytes(bytes)?))
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct AuthorizationVerifyingKey(AVK);

impl AuthorizationVerifyingKey {
    pub fn instance(&self) -> &AVK {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl AuthorizationVerifyingKey {
    #[wasm_bindgen(js_name = "fromSigningKey")]
    pub fn from_signing_key(signing_key: &AuthorizationSigningKey) -> Self {
        AuthorizationVerifyingKey(AVK::from_signing_key(&signing_key.0))
    }

    pub fn verify(
        &self,
        domain: &str,
        message: &[u8],
        signature: &AuthorizationSignature,
    ) -> Result<(), JsError> {
        Ok(self.0.verify(domain.as_bytes(), message, &signature.0)?)
    }

    #[wasm_bindgen(js_name = "fromHex")]
    pub fn from_hex(pk_hex: &str) -> Result<AuthorizationVerifyingKey, JsError> {
        use crate::arm::encryption::PublicKey;
        let pk = PublicKey::from_hex(pk_hex)?;
        Ok(AuthorizationVerifyingKey(AVK::from_affine(*pk.instance())))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.instance()
            .as_affine()
            .to_encoded_point(false)
            .as_bytes()
            .to_vec()
    }
}
