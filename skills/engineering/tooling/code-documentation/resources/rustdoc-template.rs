//! High-performance ring buffer for thread-safe audio telemetry processing.

use std::sync::atomic::{AtomicUsize, Ordering};

/// A bounded lock-free circular buffer for single-producer single-consumer telemetry pipelines.
///
/// # Invariants
/// The capacity must strictly be a power of two to allow bitwise masking
/// instead of modulo arithmetic in index calculations.
pub struct RingBuffer<T> {
    storage: Vec<T>,
    capacity_mask: usize,
    head: AtomicUsize,
    tail: AtomicUsize,
}

impl<T: Default + Clone> RingBuffer<T> {
    /// Constructs a new `RingBuffer` with capacity rounded up to the nearest power of two.
    ///
    /// # Arguments
    /// * `requested_capacity` - Desired minimum slot count.
    ///
    /// # Panics
    /// Panics if `requested_capacity` exceeds `usize::MAX / 2`.
    pub fn new(requested_capacity: usize) -> Self {
        let capacity = requested_capacity.next_power_of_two();
        Self {
            storage: vec![T::default(); capacity],
            capacity_mask: capacity - 1,
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
        }
    }
}
