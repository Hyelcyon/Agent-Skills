# C++23 Modern Tooling & Architecture Playbook

Detailed reference for CMake target-centric architectures, clang-tidy enforcement, and AddressSanitizer workflows.

---

## 1. Target-Centric `CMakeLists.txt` (C++23)

```cmake
cmake_minimum_required(VERSION 3.25)
project(ProductionEngine CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(core_engine STATIC
    src/engine.cpp
)

target_include_directories(core_engine
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
)

target_compile_features(core_engine PUBLIC cxx_std_23)

target_compile_options(core_engine PRIVATE
    -Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror
)
```

---

## 2. `.clang-tidy` Configuration for C++23

```yaml
---
Checks: >
  -*,
  bugprone-*,
  cppcoreguidelines-*,
  modernize-*,
  performance-*,
  readability-*,
  -cppcoreguidelines-pro-bounds-pointer-arithmetic

WarningsAsErrors: '*'

CheckOptions:
  - key: modernize-use-nullptr.NullMacros
    value: 'NULL'
...
```

---

## 3. C++23 `std::expected` for Exception-Free Railway Programming

```cpp
#include <expected>
#include <limits>
#include <string_view>

enum class ParseError {
    EmptyInput,
    InvalidCharacter,
    Overflow
};

std::expected<int, ParseError> parse_positive_integer(std::string_view input) {
    if (input.empty()) {
        return std::unexpected(ParseError::EmptyInput);
    }
    int value = 0;
    for (char c : input) {
        if (c < '0' || c > '9') {
            return std::unexpected(ParseError::InvalidCharacter);
        }
        const int digit = c - '0';
        if (value > (std::numeric_limits<int>::max() - digit) / 10) {
            return std::unexpected(ParseError::Overflow);
        }
        value = value * 10 + digit;
    }
    return value;
}
```
