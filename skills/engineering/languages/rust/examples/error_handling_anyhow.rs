#[derive(Debug)]
pub enum OrderProcessingError {
    EmptyCart,
    InsufficientInventory { item_id: u64, requested: u32, available: u32 },
    PaymentDeclined(String),
}

impl std::fmt::Display for OrderProcessingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyCart => write!(f, "Cannot process order with empty cart"),
            Self::InsufficientInventory { item_id, requested, available } => {
                write!(f, "Item {}: requested {} but only {} available", item_id, requested, available)
            }
            Self::PaymentDeclined(msg) => write!(f, "Payment rejected: {}", msg),
        }
    }
}

impl std::error::Error for OrderProcessingError {}

pub struct OrderProcessor;

impl OrderProcessor {
    pub fn validate_stock(item_id: u64, requested: u32, stock: u32) -> Result<(), OrderProcessingError> {
        if stock < requested {
            Err(OrderProcessingError::InsufficientInventory {
                item_id,
                requested,
                available: stock,
            })
        } else {
            Ok(())
        }
    }
}
