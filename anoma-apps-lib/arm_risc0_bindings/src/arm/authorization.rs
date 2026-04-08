use crate::arm::{action_tree::MerkleTree, encryption::PublicKey};
use arm_gadgets::authority::{
    AuthoritySignature as AS, AuthoritySigningKey as ASK, AuthorityVerifyingKey as AVK,
};
use k256::{ecdsa::Signature, elliptic_curve::sec1::ToEncodedPoint};
use serde::{Deserialize, Serialize};
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

#[wasm_bindgen]
#[derive(Clone)]
pub struct AuthoritySigningKey(pub(crate) ASK);

impl AuthoritySigningKey {
    pub fn instance(&self) -> &ASK {
        &self.0
    }
}

#[wasm_bindgen]
impl AuthoritySigningKey {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        AuthoritySigningKey::default()
    }

    pub fn sign(&self, domain: &str, message: &[u8]) -> AuthoritySignature {
        AuthoritySignature(self.0.sign(domain.as_bytes(), message))
    }

    pub fn authorize(
        &self,
        domain: &str,
        action_tree: &MerkleTree,
    ) -> Result<AuthoritySignature, JsError> {
        Ok(self.sign(domain, &action_tree.root()?.to_bytes()))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.instance().to_bytes().into()
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, JsError> {
        Ok(AuthoritySigningKey(ASK::from_bytes(bytes)?))
    }
}

impl Default for AuthoritySigningKey {
    fn default() -> Self {
        AuthoritySigningKey(ASK::new())
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct AuthoritySignature(AS);

impl AuthoritySignature {
    pub fn instance(&self) -> &AS {
        &self.0
    }

    pub fn inner(&self) -> &Signature {
        self.instance().inner()
    }
}

#[wasm_bindgen]
impl AuthoritySignature {
    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.to_bytes().to_vec()
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, JsError> {
        Ok(AuthoritySignature(AS::from_bytes(bytes)?))
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct AuthorityVerifyingKey(AVK);

impl AuthorityVerifyingKey {
    pub fn instance(&self) -> &AVK {
        &self.0
    }
}

#[wasm_bindgen]
impl AuthorityVerifyingKey {
    #[wasm_bindgen(constructor)]
    pub fn new(pk_bytes: &[u8]) -> Result<AuthorityVerifyingKey, JsError> {
        let pk = PublicKey::new(pk_bytes)?;
        Ok(AuthorityVerifyingKey(AVK::from_affine(*pk.instance())))
    }

    #[wasm_bindgen(js_name = "fromSigningKey")]
    pub fn from_signing_key(signing_key: &AuthoritySigningKey) -> Self {
        AuthorityVerifyingKey(AVK::from_signing_key(&signing_key.0))
    }

    pub fn verify(
        &self,
        domain: &str,
        message: &[u8],
        signature: &AuthoritySignature,
    ) -> Result<(), JsError> {
        Ok(self.0.verify(domain.as_bytes(), message, &signature.0)?)
    }

    #[wasm_bindgen(js_name = "fromHex")]
    pub fn from_hex(pk_hex: &str) -> Result<AuthorityVerifyingKey, JsError> {
        AuthorityVerifyingKey::new(&hex::decode(pk_hex)?)
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
