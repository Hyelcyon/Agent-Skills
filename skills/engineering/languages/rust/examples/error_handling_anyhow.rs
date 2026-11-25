use thiserror::Error;

#[derive(Error, Debug, Clone, PartialEq, Eq)]
pub enum OrderProcessingError {
    #[error("cannot process order with empty cart")]
    EmptyCart,
    #[error("item {item_id}: requested {requested} but only {available} available")]
    InsufficientInventory { item_id: u64, requested: u32, available: u32 },
    #[error("payment rejected: {0}")]
    PaymentDeclined(String),
}

pub struct OrderProcessor;

impl OrderProcessor {
    pub fn validate_stock(
        item_id: u64,
        requested: u32,
        stock: u32,
    ) -> Result<(), OrderProcessingError> {
        if stock < requested {
            return Err(OrderProcessingError::InsufficientInventory {
                item_id,
                requested,
                available: stock,
            });
        }
        Ok(())
    }
}
