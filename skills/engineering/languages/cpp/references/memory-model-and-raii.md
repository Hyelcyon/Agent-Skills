# Modern C++ Memory Model, RAII, and Concurrency Architecture

Engineering standards for resource safety, deterministic lifetimes, smart pointer ownership semantics, and atomic memory ordering in modern C++.

## 1. Resource Acquisition Is Initialization (RAII) and the Rule of Zero

Modern C++ design mandates that resources (heap memory, file handles, mutex locks, network sockets) are bound strictly to object lifetimes.

### The Rule of Zero

Classes should avoid declaring custom destructors, copy operations, or move operations whenever possible. By composing members using standard RAII wrappers (`std::string`, `std::vector`, `std::unique_ptr`), the compiler synthesizes correct, optimal lifecycle operations automatically.

```cpp
#include <string>
#include <vector>
#include <memory>

class UserRegistry {
    std::string registry_name;
    std::vector<std::string> user_records;
    std::unique_ptr<int[]> buffer;
public:
    explicit UserRegistry(std::string name)
        : registry_name(std::move(name)), buffer(std::make_unique<int[]>(1024)) {}
};
```

---

## 2. Managing OS Handles with Custom Deleters

When interfacing with operating system handles or legacy C APIs, encapsulate the handle in `std::unique_ptr` using a stateless custom deleter.

```cpp
#include <cstdio>
#include <memory>

struct FileCloser {
    void operator()(std::FILE* fp) const noexcept {
        if (fp != nullptr) {
            std::fclose(fp);
        }
    }
};

using UniqueFile = std::unique_ptr<std::FILE, FileCloser>;

UniqueFile open_secure_file(const char* filepath, const char* mode) {
    return UniqueFile(std::fopen(filepath, mode));
}
```

Because `FileCloser` is an empty struct, `std::unique_ptr<std::FILE, FileCloser>` has zero size overhead compared to a raw pointer and automatically invokes `std::fclose` upon going out of scope or unwinding during an exception.

---

## 3. The Rule of Five and Move Invariants

When managing non-standard resources directly, implement all five special member functions and mark move operations `noexcept`.

```cpp
#include <utility>
#include <cstddef>

class NativeMemoryBlock {
    char* data_ptr{nullptr};
    std::size_t block_size{0};

public:
    explicit NativeMemoryBlock(std::size_t size)
        : data_ptr(new char[size]), block_size(size) {}

    ~NativeMemoryBlock() noexcept {
        delete[] data_ptr;
    }

    NativeMemoryBlock(const NativeMemoryBlock& other)
        : data_ptr(new char[other.block_size]), block_size(other.block_size) {
        std::copy(other.data_ptr, other.data_ptr + other.block_size, data_ptr);
    }

    NativeMemoryBlock& operator=(const NativeMemoryBlock& other) {
        if (this != &other) {
            char* new_data = new char[other.block_size];
            std::copy(other.data_ptr, other.data_ptr + other.block_size, new_data);
            delete[] data_ptr;
            data_ptr = new_data;
            block_size = other.block_size;
        }
        return *this;
    }

    NativeMemoryBlock(NativeMemoryBlock&& other) noexcept
        : data_ptr(std::exchange(other.data_ptr, nullptr)),
          block_size(std::exchange(other.block_size, 0)) {}

    NativeMemoryBlock& operator=(NativeMemoryBlock&& other) noexcept {
        if (this != &other) {
            delete[] data_ptr;
            data_ptr = std::exchange(other.data_ptr, nullptr);
            block_size = std::exchange(other.block_size, 0);
        }
        return *this;
    }
};
```

Standard containers like `std::vector` require `noexcept` move constructors to safely move elements during reallocation instead of falling back to copying.

---

## 4. Atomic Operations and Memory Ordering

For lock-free data structures and thread synchronization, choose the least restrictive memory ordering that satisfies visibility invariants.

```cpp
#include <atomic>

class LockFreeSpinLock {
    std::atomic<bool> flag{false};

public:
    void lock() noexcept {
        while (flag.exchange(true, std::memory_order_acquire)) {
            while (flag.load(std::memory_order_relaxed)) {
                #if defined(__x86_64__) || defined(_M_X64)
                __builtin_ia32_pause();
                #endif
            }
        }
    }

    void unlock() noexcept {
        flag.store(false, std::memory_order_release);
    }
};
```

1. **`std::memory_order_relaxed`**: Guarantees atomic operations without cross-variable ordering constraints.
2. **`std::memory_order_acquire`**: Ensures subsequent reads and writes cannot be reordered before this operation.
3. **`std::memory_order_release`**: Ensures prior reads and writes cannot be reordered after this operation, synchronizing with threads acquiring the flag.
