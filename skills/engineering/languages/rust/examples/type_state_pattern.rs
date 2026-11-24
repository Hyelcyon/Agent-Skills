use std::marker::PhantomData;
use std::sync::{Arc, Mutex};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PipelineError {
    #[error("connection rejected by target `{0}`")]
    ConnectionRejected(String),
    #[error("unauthorized execution state")]
    Unauthorized,
}

pub struct Uninitialized;
pub struct Ready;

pub struct SecureChannel<State> {
    endpoint: String,
    token: Arc<Mutex<Option<String>>>,
    _state: PhantomData<State>,
}

impl SecureChannel<Uninitialized> {
    pub fn new(endpoint: impl Into<String>) -> Self {
        Self {
            endpoint: endpoint.into(),
            token: Arc::new(Mutex::new(None)),
            _state: PhantomData,
        }
    }

    pub fn authenticate(self, secret: &str) -> Result<SecureChannel<Ready>, PipelineError> {
        if secret.is_empty() {
            return Err(PipelineError::Unauthorized);
        }
        *self.token.lock().expect("token lock should not be poisoned") = Some(secret.to_string());
        Ok(SecureChannel {
            endpoint: self.endpoint,
            token: self.token,
            _state: PhantomData,
        })
    }
}

impl SecureChannel<Ready> {
    pub fn send(&self, payload: &[u8]) -> usize {
        payload.len()
    }
}
