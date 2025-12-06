use arm_gadgets::encryption::{Ciphertext as C, SecretKey as SK};
use k256::AffinePoint;
use serde::{self, Deserialize, Serialize};

#[cfg(feature = "wasm")]
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
#[cfg(feature = "wasm")]
use k256::{
    CompressedPoint, ProjectivePoint, Scalar, elliptic_curve::PrimeField,
    elliptic_curve::group::GroupEncoding,
};
#[cfg(feature = "wasm")]
use tsify::Tsify;
#[cfg(feature = "wasm")]
use wasm_bindgen::{JsError, JsValue, prelude::wasm_bindgen};

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone, Serialize, Deserialize)]
pub struct SecretKey(pub(crate) SK);

impl SecretKey {
    pub fn instance(&self) -> &SK {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl SecretKey {
    #[wasm_bindgen(constructor)]
    pub fn new(bytes: &[u8]) -> Result<Self, JsError> {
        SecretKey::from_bytes(bytes.to_vec())
    }

    pub fn random() -> SecretKey {
        SecretKey(SK::random())
    }

    #[wasm_bindgen(js_name = "toPublicKey")]
    pub fn to_public_key(&self) -> PublicKey {
        PublicKey((ProjectivePoint::GENERATOR * self.instance().clone().inner()).to_affine())
    }

    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: Vec<u8>) -> Result<SecretKey, JsError> {
        let sk_bytes: [u8; 32] = bytes
            .try_into()
            .map_err(|e| JsError::new(&format!("{:?}", &e)))?;
        Ok(SecretKey(SK::new(
            Scalar::from_repr(sk_bytes.into())
                .into_option()
                .ok_or(JsError::new(
                    "Could not instantiate Scalar from secret key bytes",
                ))?,
        )))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.inner().clone().to_bytes().to_vec()
    }

    #[wasm_bindgen(js_name = "fromBase64")]
    pub fn from_base64(sk_b64: &str) -> Result<SecretKey, JsError> {
        SecretKey::from_bytes(b64.decode(sk_b64)?)
    }

    #[wasm_bindgen(js_name = "toBase64")]
    pub fn to_base64(&self) -> String {
        b64.encode(self.to_bytes())
    }

    #[wasm_bindgen(js_name = "fromHex")]
    pub fn from_hex(sk_hex: &str) -> Result<SecretKey, JsError> {
        let sk_bytes: [u8; 32] = hex::decode(sk_hex)?
            .try_into()
            .map_err(|e| JsError::new(&format!("{:?}", &e)))?;

        SecretKey::from_bytes(sk_bytes.to_vec())
    }

    #[wasm_bindgen(js_name = "toHex")]
    pub fn to_hex(&self) -> String {
        hex::encode(self.to_bytes())
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PublicKey(pub(crate) AffinePoint);

impl PublicKey {
    pub fn instance(&self) -> &AffinePoint {
        &self.0
    }
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl PublicKey {
    #[cfg_attr(feature = "wasm", wasm_bindgen(constructor))]
    pub fn new(bytes: &[u8]) -> Result<Self, JsError> {
        let bytes: [u8; 33] = bytes.try_into()?;
        Ok(PublicKey(
            // TODO: Update to remove deprecated `ComppressedPoint::from_slice`
            #[allow(deprecated)]
            AffinePoint::from_bytes(CompressedPoint::from_slice(&bytes))
                .into_option()
                .ok_or(JsError::new("Could not recover AffinePoint from bytes"))?,
        ))
    }

    #[wasm_bindgen(js_name = "fromBase64")]
    pub fn from_base64(pk_b64: &str) -> Result<PublicKey, JsError> {
        PublicKey::new(&b64.decode(pk_b64)?)
    }

    #[wasm_bindgen(js_name = "toBase64")]
    pub fn to_base64(&self) -> Result<String, JsError> {
        Ok(b64.encode(self.encode()?))
    }

    #[wasm_bindgen(js_name = "fromHex")]
    pub fn from_hex(pk_hex: &str) -> Result<PublicKey, JsError> {
        PublicKey::new(&hex::decode(pk_hex)?)
    }

    #[wasm_bindgen(js_name = "toHex")]
    pub fn to_hex(&self) -> String {
        let pk_bytes = &self.to_bytes();
        hex::encode(pk_bytes)
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.to_bytes().to_vec()
    }

    pub fn serialize(&self) -> Result<Vec<u8>, JsError> {
        Ok(serde_json::to_vec(&self.0)?)
    }

    pub fn deserialize(bytes: &[u8]) -> Result<PublicKey, JsError> {
        Ok(PublicKey(serde_json::from_slice(bytes)?))
    }

    pub fn encode(&self) -> Result<Vec<u8>, JsError> {
        Ok(bincode::serialize(&self.0)?)
    }
}

#[cfg(feature = "wasm")]
#[derive(Tsify, Debug, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EncodedKeypair {
    pub secret_key: String,
    pub public_key: String,
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Clone, Serialize, Deserialize)]
pub struct Keypair {
    #[cfg_attr(feature = "wasm", wasm_bindgen(getter_with_clone))]
    pub sk: SecretKey,
    #[cfg_attr(feature = "wasm", wasm_bindgen(getter_with_clone))]
    pub pk: PublicKey,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl Keypair {
    pub fn new(sk_bytes: &[u8], pk_bytes: &[u8]) -> Result<Self, JsError> {
        let sk = SecretKey::new(sk_bytes)?;
        let pk = PublicKey::new(pk_bytes)?;

        Ok(Keypair { sk, pk })
    }

    pub fn encode(&self) -> Result<EncodedKeypair, JsError> {
        Ok(EncodedKeypair {
            secret_key: self.sk.to_base64(),
            public_key: self.pk.to_base64()?,
        })
    }

    pub fn decode(encoded: &EncodedKeypair) -> Result<Keypair, JsError> {
        Ok(Keypair {
            sk: SecretKey::from_base64(&encoded.secret_key)?,
            pk: PublicKey::from_base64(&encoded.public_key)?,
        })
    }

    pub fn random() -> Keypair {
        let sk = SecretKey::random();
        let pk = sk.to_public_key();
        Keypair { sk, pk }
    }

    pub fn serialize(&self) -> Result<Vec<u8>, JsError> {
        Ok(serde_json::to_vec(&self)?)
    }

    pub fn deserialize(bytes: &[u8]) -> Result<SecretKey, JsError> {
        Ok(serde_json::from_slice(bytes)?)
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Ciphertext(pub(crate) C);

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl Ciphertext {
    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: Vec<u8>) -> Self {
        Ciphertext(C::from_bytes(bytes))
    }

    #[wasm_bindgen(js_name = "fromWords")]
    pub fn from_words(words: &[u32]) -> Self {
        Ciphertext(C::from_words(words))
    }

    pub fn inner(&self) -> Vec<u8> {
        self.0.inner().to_vec()
    }

    #[wasm_bindgen(js_name = "asWords")]
    pub fn as_words(&self) -> Vec<u32> {
        self.0.as_words()
    }

    pub fn encrypt(
        message: &[u8],
        receiver_pk: PublicKey,
        sender_sk: SecretKey,
    ) -> Result<Self, JsError> {
        Ok(Ciphertext(C::encrypt(
            &message.to_vec(),
            &receiver_pk.0,
            &sender_sk.0,
        )?))
    }

    pub fn decrypt(&self, sk: &SecretKey) -> Result<Vec<u8>, JsError> {
        Ok(self
            .0
            .decrypt(&sk.0)
            .map_err(|e| JsError::new(&e.to_string()))?
            .as_bytes()
            .to_vec())
    }

    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(&self) -> Result<JsValue, JsError> {
        Ok(serde_wasm_bindgen::to_value(self)?)
    }
}
