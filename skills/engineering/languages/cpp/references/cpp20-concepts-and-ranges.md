# Modern C++ Concepts and Ranges Architecture (C++20 / C++23)

Architectural patterns for template metaprogramming constraints using C++20/C++23 Concepts and lazy evaluation pipelines with `std::ranges` and `std::views`.

## 1. Replacing SFINAE with C++20 Concepts

Prior to C++20, compile-time type constraints relied on complex `std::enable_if_t` and SFINAE patterns that produced cryptic compiler error diagnostics. C++20 Concepts define named constraints with readable compile-time failure reports.

### Custom Concept Definition

```cpp
#include <concepts>
#include <string>

template <typename T>
concept Serializable = requires(T item) {
    { item.serialize() } -> std::same_as<std::string>;
    { item.size_bytes() } -> std::convertible_to<std::size_t>;
};

template <typename T>
concept NumericIdentifier = std::integral<T> && !std::same_as<T, bool>;
```

### Constrained Functions and Overloads

Concepts can constrain function parameters directly using abbreviated function template syntax:

```cpp
template <Serializable T>
void transmit_record(const T& record) {
    auto payload = record.serialize();
}

template <typename T>
requires Serializable<T> && (sizeof(T) <= 64)
void cache_record(const T& record) {
    auto payload = record.serialize();
}
```

If a type fails to meet the `Serializable` concept, the compiler pinpoints the exact missing method (`serialize()` or `size_bytes()`) rather than producing deep substitution failure call stacks.

---

## 2. Composable Lazy Pipelines with std::ranges and std::views

The `std::ranges` library replaces iterator pair algorithms (`std::transform(begin, end, ...)`) with lazy, composable range adaptors evaluated on demand without intermediate heap allocations.

```cpp
#include <vector>
#include <ranges>
#include <string>
#include <iostream>

struct Order {
    int id;
    double total;
    bool fulfilled;
};

void process_active_orders(const std::vector<Order>& orders) {
    auto high_value_unfulfilled = orders
        | std::views::filter([](const Order& o) { return !o.fulfilled && o.total > 100.0; })
        | std::views::transform([](const Order& o) { return o.id; })
        | std::views::take(5);

    for (int order_id : high_value_unfulfilled) {
        std::cout << order_id << '\n';
    }
}
```

The range adaptors execute lazily during iteration: no temporary vectors are created, and processing stops as soon as the fifth element is consumed.

---

## 3. Projections in Standard Algorithms

C++20 algorithms accept projections, allowing direct inspection of struct members without custom lambda predicates:

```cpp
#include <vector>
#include <algorithm>

struct User {
    std::string name;
    int priority;
};

void sort_users_by_priority(std::vector<User>& users) {
    std::ranges::sort(users, std::greater<>{}, &User::priority);
}

bool contains_admin(const std::vector<User>& users) {
    return std::ranges::any_of(users, [](int p) { return p >= 10; }, &User::priority);
}
```

Using `&User::priority` as the projection argument passes the member value directly to the comparison function, simplifying algorithmic expressions.
