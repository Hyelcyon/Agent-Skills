---
name: cpp
description: Use when authoring or reviewing Modern C++20/C++23 or C code, enforcing RAII and smart pointer ownership, implementing C++20 concepts and ranges pipelines, or managing move semantics.
---

# Modern C++ Senior Engineering (C++20 / C++23)

Production guidelines for modern C++ development, enforcing deterministic resource safety via RAII, zero-cost move semantics, concept constraints, and composable ranges.

## When to Use
- Writing C++20/C++23 applications and native systems.
- Constraining templates with explicit C++20 Concepts instead of SFINAE.
- Building lazy evaluation algorithms with C++20/C++23 Ranges.
- Enforcing ownership models via `std::unique_ptr` and the Rule of Zero/Five.

## When NOT to Use
- High-level web application frontend or UI layout (use `typescript` or `html-css`).
- Rapid scripting tasks suited for Python or shell.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Compiler Standard & Warning Baseline (C++20/C++23, -Wall -Wextra)
Phase 2: Ownership Architecture & RAII Boundary Definition
Phase 3: Compile-Time Constraint Formulation (C++20 Concepts)
Phase 4: Zero-Cost Composable Execution (Ranges, std::move with noexcept)
Phase 5: Sanitizer & Memory Leak Verification (ASan, UBSan, Valgrind)
```

### Phase 1: Compiler Standard & Warning Baseline
Verify CMake targets C++20 or C++23 standard. Mandate strict compiler warnings: `-Wall -Wextra -Wpedantic -Werror`.

### Phase 2: Ownership Architecture & RAII Boundaries
Never manage memory via raw `new` / `delete`. Mandate `std::unique_ptr` for exclusive ownership and standard containers for data buffers. Apply the Rule of Zero or explicitly define the Rule of Five.

### Phase 3: Compile-Time Constraint Formulation
Constrain template interfaces using C++20 Concepts instead of legacy SFINAE:
```cpp
template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <Numeric T>
T calculate_ratio(T part, T total) {
    return total == static_cast<T>(0) ? static_cast<T>(0) : (part / total);
}
```

### Phase 4: Zero-Cost Composable Execution
Process data lazily using `std::views`. Always mark move constructors and move assignment operators as `noexcept` to prevent standard containers from falling back to expensive copies.

### Phase 5: Verification & Sanitizer Evidence
Execute tests with runtime sanitizers enabled:
```bash
cmake -B build -DCMAKE_BUILD_TYPE=Debug -DENABLE_ASAN=ON
cmake --build build
ctest --test-dir build --output-on-failure
```

---

## Prohibited Anti-Patterns

- ❌ Calling `new` or `delete` directly (use `std::make_unique` or standard containers).
- ❌ Using `return std::move(localVar)` (inhibits RVO/NRVO copy elision).
- ❌ Using preprocessor macros for type metaprogramming (use Concepts or `constexpr`).
- ❌ Omitting `noexcept` on move constructors and move assignment operators.
- ❌ Slicing polymorphic objects by passing them by value instead of `const&` or smart pointer.

---

## References & Documentation
- Modern C++ Tooling Runbook: [references/modern-cpp-tooling.md](./references/modern-cpp-tooling.md)
- C++20 Concepts & Ranges: [references/cpp20-concepts-and-ranges.md](./references/cpp20-concepts-and-ranges.md)
- Memory Model & RAII: [references/memory-model-and-raii.md](./references/memory-model-and-raii.md)

## Resources & Examples
- CMake Build Config: [resources/CMakeLists.txt](./resources/CMakeLists.txt)
- Clang-Tidy Lint Rules: [resources/.clang-tidy](./resources/.clang-tidy)
- Clang-Format Style Config: [resources/.clang-format](./resources/.clang-format)
- Expected & Ranges Demo: [examples/expected_ranges_demo.cpp](./examples/expected_ranges_demo.cpp)
- RAII Resource Guard: [examples/raii_resource_guard.cpp](./examples/raii_resource_guard.cpp)
- Concepts Compile-Time Validator: [examples/concepts_sfinae_validator.cpp](./examples/concepts_sfinae_validator.cpp)
