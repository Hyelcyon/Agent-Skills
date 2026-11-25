//! Bounded circular buffer illustrating Rustdoc invariant and panic contracts.

use std::sync::atomic::{AtomicUsize, Ordering};

/// Bounded circular buffer with power-of-two capacity.
///
/// # Invariants
/// `storage.len()` is always a power of two (`capacity_mask + 1`), allowing bitwise
/// masking (`index & capacity_mask`) instead of modulo division on hot paths.
pub struct RingBuffer<T> {
    storage: Vec<T>,
    capacity_mask: usize,
    head: AtomicUsize,
    tail: AtomicUsize,
}

impl<T: Default + Clone> RingBuffer<T> {
    /// Constructs a `RingBuffer` whose capacity is rounded up to the next power of two.
    ///
    /// # Arguments
    /// * `requested_capacity` - Minimum slot count (`0` rounds up to `1`).
    ///
    /// # Panics
    /// Panics if `requested_capacity` exceeds `(usize::MAX >> 1) + 1`, where
    /// `next_power_of_two()` overflows `usize`.
    pub fn new(requested_capacity: usize) -> Self {
        let capacity = requested_capacity.next_power_of_two();
        Self {
            storage: vec![T::default(); capacity],
            capacity_mask: capacity - 1,
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
        }
    }

    /// Writes `value` into the next free slot, returning `false` when the buffer is full.
    pub fn try_push(&mut self, value: T) -> bool {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Acquire);
        if head.wrapping_sub(tail) >= self.storage.len() {
            return false;
        }
        self.storage[head & self.capacity_mask] = value;
        self.head.store(head.wrapping_add(1), Ordering::Release);
        true
    }

    /// Removes and returns the oldest queued element, or `None` when empty.
    pub fn try_pop(&mut self) -> Option<T> {
        let tail = self.tail.load(Ordering::Relaxed);
        let head = self.head.load(Ordering::Acquire);
        if tail == head {
            return None;
        }
        let value = self.storage[tail & self.capacity_mask].clone();
        self.tail.store(tail.wrapping_add(1), Ordering::Release);
        Some(value)
    }
}
