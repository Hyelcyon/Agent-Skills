use std::sync::atomic::{AtomicUsize, Ordering};

/// Fixed-capacity reservation tracker for concurrent worker tasks.
///
/// # Invariants
/// * `capacity` is strictly within `1..=isize::MAX as usize` and immutable after construction.
/// * `active` never exceeds `capacity` under concurrent `try_acquire` calls.
pub struct BoundedTaskTracker {
    capacity: usize,
    active: AtomicUsize,
}

impl BoundedTaskTracker {
    /// Creates a bounded tracker, returning `None` if `capacity` is `0` or exceeds `isize::MAX as usize`.
    pub fn new(capacity: usize) -> Option<Self> {
        if capacity == 0 || capacity > isize::MAX as usize {
            return None;
        }
        Some(Self {
            capacity,
            active: AtomicUsize::new(0),
        })
    }

    /// Attempts to claim one task slot without blocking.
    ///
    /// Uses a CAS loop with `AcqRel` on success so callers observe prior releases
    /// before entering the bounded section.
    pub fn try_acquire(&self) -> bool {
        let mut current = self.active.load(Ordering::Acquire);
        loop {
            if current >= self.capacity {
                return false;
            }
            match self.active.compare_exchange_weak(
                current,
                current + 1,
                Ordering::AcqRel,
                Ordering::Acquire,
            ) {
                Ok(_) => return true,
                Err(observed) => current = observed,
            }
        }
    }

    /// Releases a previously acquired slot.
    ///
    /// # Panics
    /// Panics if called when no slots are active, preventing wraparound underflow.
    pub fn release(&self) {
        self.active
            .fetch_update(Ordering::Release, Ordering::Acquire, |current| {
                if current == 0 {
                    None
                } else {
                    Some(current - 1)
                }
            })
            .expect("BoundedTaskTracker::release called with zero active slots");
    }

    pub fn capacity(&self) -> usize {
        self.capacity
    }
}
