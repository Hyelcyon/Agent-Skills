# Rust Memory Management, RAII, and Sound Unsafe Architecture

Guidelines for ownership guarantees, zero-cost abstractions, lifetime management, variance enforcement, and sound encapsulation of unsafe operations in Rust.

## 1. Ownership Invariants and Exclusive Aliasing

Rust enforces the core aliasing rule: a memory location can have either any number of immutable references (`&T`) or exactly one mutable reference (`&mut T`), but never both simultaneously.

### Structuring Safe Memory Layouts

Avoid self-referential structs where a field points to data owned by another field in the same struct. Instead, use handle-based index arenas (`generational-arena` or `slotmap`) or decoupled ownership trees.

---

## 2. Variance and PhantomData Markers

Generic structs that manage raw pointers or logical lifetimes must declare their variance and ownership to the compiler via `std::marker::PhantomData`.

```rust
use std::marker::PhantomData;
use std::ptr::NonNull;

pub struct CustomSlice<'a, T> {
    ptr: NonNull<T>,
    len: usize,
    _marker: PhantomData<&'a T>,
}

impl<'a, T> CustomSlice<'a, T> {
    pub fn new(slice: &'a [T]) -> Self {
        let ptr = NonNull::new(slice.as_ptr() as *mut T).expect("Slice pointer must not be null");
        Self {
            ptr,
            len: slice.len(),
            _marker: PhantomData,
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }
}
```

The `PhantomData<&'a T>` marker ensures that `CustomSlice` is covariant over `'a` and `T`, preventing use-after-free bugs if the referenced slice goes out of scope while `CustomSlice` is still referenced.

---

## 3. RAII and Safe Encapsulation of Unsafe Blocks

Every `unsafe` block must be strictly private and wrapped inside a sound public API that maintains all invariants.

### Safety Invariants Checklist

When writing an `unsafe` block, guarantee:
1. Pointers are aligned and non-null before dereferencing.
2. Memory bounds are strictly checked prior to offsetting.
3. No aliasing violations occur between raw pointers and active Rust references.
4. Panic safety: if code panics halfway through an operation, destructors (`Drop`) do not trigger double-free or expose uninitialized memory.

```rust
pub struct AlignedBuffer {
    ptr: NonNull<u8>,
    capacity: usize,
}

impl AlignedBuffer {
    pub fn allocate(size: usize) -> Self {
        assert!(size > 0, "Allocation size must be positive");
        let layout = std::alloc::Layout::from_size_align(size, 64).expect("Invalid layout parameters");
        let raw_ptr = unsafe { std::alloc::alloc(layout) };
        let ptr = NonNull::new(raw_ptr).expect("Allocation failed");
        Self { ptr, capacity: size }
    }

    pub fn as_slice(&self) -> &[u8] {
        unsafe { std::slice::from_raw_parts(self.ptr.as_ptr(), self.capacity) }
    }
}

impl Drop for AlignedBuffer {
    fn drop(&mut self) {
        let layout = std::alloc::Layout::from_size_align(self.capacity, 64)
            .expect("invariant: layout validated during AlignedBuffer::allocate");
        unsafe {
            std::alloc::dealloc(self.ptr.as_ptr(), layout);
        }
    }
}
```

---

## 4. Verification with Miri

Static analysis and `cargo check` cannot detect undefined behavior hidden behind raw pointer manipulation. Always verify unsafe blocks using Miri:

```bash
cargo +nightly miri test
```

Miri executes Rust code directly on an abstract machine interpreter, checking:
- Out-of-bounds memory accesses and buffer overruns.
- Violation of Stacked Borrows / Tree Borrows aliasing rules.
- Execution of uninitialized memory.
- Data races in concurrent multithreaded workflows.
