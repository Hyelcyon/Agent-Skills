/// High-throughput ring buffer tracking bounded tasks across worker threads.
///
/// # Invariants
/// * Capacity is fixed at construction and never dynamically reallocated.
/// * Thread-safe synchronization is maintained via atomic monotonic operations.
pub struct BoundedTaskRingBuffer {
    capacity: usize,
    count: std::sync::atomic::AtomicUsize,
}

impl BoundedTaskRingBuffer {
    /// Creates a new bounded buffer with the specified capacity limit.
    ///
    /// # Errors
    /// Returns `None` if `capacity` is 0 or exceeds `isize::MAX as usize`.
    pub fn new(capacity: usize) -> Option<Self> {
        if capacity == 0 || capacity > isize::MAX as usize {
            None
        } else {
            Some(Self {
                capacity,
                count: std::sync::atomic::AtomicUsize::new(0),
            })
        }
    }

    /// Returns the maximum capacity limit of the ring buffer.
    pub fn capacity(&self) -> usize {
        self.capacity
    }
}
