use crate::error::BindingsError;
use arm_gadgets::encryption::{Ciphertext as C, SecretKey as SK};
use base64::{Engine as _, engine::general_purpose::STANDARD as b64};
use k256::AffinePoint;
use k256::{
    CompressedPoint, ProjectivePoint, Scalar, elliptic_curve::PrimeField,
    elliptic_curve::group::GroupEncoding,
};
use serde::{self, Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize, uniffi::Object)]
pub struct SecretKey(pub(crate) SK);

impl SecretKey {
    pub fn instance(&self) -> &SK {
        &self.0
    }
}

#[uniffi::export]
impl SecretKey {
    #[uniffi::constructor]
    pub fn new(bytes: &[u8]) -> Result<Self, BindingsError> {
        SecretKey::from_bytes(bytes.to_vec())
    }

    #[uniffi::constructor]
    pub fn random() -> SecretKey {
        SecretKey(SK::random())
    }

    pub fn to_public_key(&self) -> PublicKey {
        PublicKey((ProjectivePoint::GENERATOR * self.instance().clone().inner()).to_affine())
    }

    #[uniffi::constructor]
    pub fn from_bytes(bytes: Vec<u8>) -> Result<SecretKey, BindingsError> {
        let sk_bytes: [u8; 32] = bytes
            .try_into()
            .map_err(|e| BindingsError::new(format!("{:?}", &e)))?;
        Ok(SecretKey(SK::new(
            Scalar::from_repr(sk_bytes.into())
                .into_option()
                .ok_or(BindingsError::new(
                    "Could not instantiate Scalar from secret key bytes",
                ))?,
        )))
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.inner().clone().to_bytes().to_vec()
    }

    #[uniffi::constructor]
    pub fn from_base64(sk_b64: &str) -> Result<SecretKey, BindingsError> {
        SecretKey::from_bytes(b64.decode(sk_b64)?)
    }

    pub fn to_base64(&self) -> String {
        b64.encode(self.to_bytes())
    }

    #[uniffi::constructor]
    pub fn from_hex(sk_hex: &str) -> Result<SecretKey, BindingsError> {
        let sk_bytes: [u8; 32] = hex::decode(sk_hex)?
            .try_into()
            .map_err(|e| BindingsError::new(format!("{:?}", &e)))?;

        SecretKey::from_bytes(sk_bytes.to_vec())
    }

    pub fn to_hex(&self) -> String {
        hex::encode(self.to_bytes())
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, uniffi::Object)]
pub struct PublicKey(pub(crate) AffinePoint);

impl PublicKey {
    pub fn instance(&self) -> &AffinePoint {
        &self.0
    }
}

#[uniffi::export]
impl PublicKey {
    #[uniffi::constructor]
    pub fn new(bytes: &[u8]) -> Result<Self, BindingsError> {
        let bytes: [u8; 33] = bytes.try_into()?;
        Ok(PublicKey(
            // TODO: Update to remove deprecated `ComppressedPoint::from_slice`
            #[allow(deprecated)]
            AffinePoint::from_bytes(CompressedPoint::from_slice(&bytes))
                .into_option()
                .ok_or(BindingsError::new(
                    "Could not recover AffinePoint from bytes",
                ))?,
        ))
    }

    #[uniffi::constructor]
    pub fn from_base64(pk_b64: &str) -> Result<PublicKey, BindingsError> {
        PublicKey::from_affine_point_bytes(&b64.decode(pk_b64)?)
    }

    pub fn to_base64(&self) -> Result<String, BindingsError> {
        Ok(b64.encode(self.to_affine_point_bytes()?))
    }

    #[uniffi::constructor]
    pub fn from_hex(pk_hex: &str) -> Result<PublicKey, BindingsError> {
        PublicKey::new(&hex::decode(pk_hex)?)
    }

    pub fn to_hex(&self) -> String {
        let pk_bytes = &self.to_bytes();
        hex::encode(pk_bytes)
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.to_bytes().to_vec()
    }

    pub fn to_affine_point_bytes(&self) -> Result<Vec<u8>, BindingsError> {
        Ok(serde_json::to_vec(&self.0)?)
    }

    #[uniffi::constructor]
    pub fn from_affine_point_bytes(bytes: &[u8]) -> Result<PublicKey, BindingsError> {
        Ok(PublicKey(serde_json::from_slice(bytes)?))
    }

    pub fn encode(&self) -> Result<Vec<u8>, BindingsError> {
        Ok(bincode::serialize(&self.0)?)
    }
}

#[derive(Debug, Serialize, Deserialize, uniffi::Record)]
pub struct EncodedKeypair {
    pub secret_key: String,
    pub public_key: String,
}

#[derive(Clone, Serialize, Deserialize, uniffi::Object)]
pub struct Keypair {
    pub sk: SecretKey,
    pub pk: PublicKey,
}

#[uniffi::export]
impl Keypair {
    #[uniffi::constructor]
    pub fn new(sk_bytes: &[u8], pk_bytes: &[u8]) -> Result<Self, BindingsError> {
        let sk = SecretKey::new(sk_bytes)?;
        let pk = PublicKey::new(pk_bytes)?;

        Ok(Keypair { sk, pk })
    }

    pub fn sk(&self) -> SecretKey {
        self.sk.clone()
    }

    pub fn pk(&self) -> PublicKey {
        self.pk.clone()
    }

    pub fn encode(&self) -> Result<EncodedKeypair, BindingsError> {
        Ok(EncodedKeypair {
            secret_key: self.sk.to_base64(),
            public_key: self.pk.to_base64()?,
        })
    }

    #[uniffi::constructor]
    pub fn decode(encoded: EncodedKeypair) -> Result<Keypair, BindingsError> {
        Ok(Keypair {
            sk: SecretKey::from_base64(&encoded.secret_key)?,
            pk: PublicKey::from_base64(&encoded.public_key)?,
        })
    }

    #[uniffi::constructor]
    pub fn random() -> Keypair {
        let sk = SecretKey::random();
        let pk = sk.to_public_key();
        Keypair { sk, pk }
    }

    #[uniffi::method(name = "serialize")]
    pub fn serialize_json(&self) -> Result<Vec<u8>, BindingsError> {
        Ok(serde_json::to_vec(&self)?)
    }

    #[uniffi::constructor(name = "deserialize")]
    pub fn deserialize_json(bytes: &[u8]) -> Result<Keypair, BindingsError> {
        Ok(serde_json::from_slice(bytes)?)
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, uniffi::Object)]
pub struct Ciphertext(pub(crate) C);

#[uniffi::export]
impl Ciphertext {
    #[uniffi::constructor]
    pub fn from_bytes(bytes: Vec<u8>) -> Self {
        Ciphertext(C::from_bytes(bytes))
    }

    #[uniffi::constructor]
    pub fn from_words(words: &[u32]) -> Self {
        Ciphertext(C::from_words(words))
    }

    pub fn inner(&self) -> Vec<u8> {
        self.0.inner().to_vec()
    }

    pub fn as_words(&self) -> Vec<u32> {
        self.0.as_words()
    }

    #[uniffi::constructor]
    pub fn encrypt(
        message: &[u8],
        receiver_pk: &PublicKey,
        sender_sk: &SecretKey,
    ) -> Result<Self, BindingsError> {
        Ok(Ciphertext(C::encrypt(
            &message.to_vec(),
            &receiver_pk.0,
            &sender_sk.0,
        )?))
    }

    pub fn decrypt(&self, sk: &SecretKey) -> Result<Vec<u8>, BindingsError> {
        Ok(self
            .0
            .decrypt(&sk.0)
            .map_err(|e| BindingsError::new(e.to_string()))?
            .as_bytes()
            .to_vec())
    }

    pub fn to_json(&self) -> Result<String, BindingsError> {
        Ok(serde_json::to_string(self)?)
    }
}
