#include <expected>
#include <string>
#include <string_view>
#include <vector>
#include <ranges>
#include <iostream>

enum class DomainError {
    EmptyPayload,
    InvalidRange,
    Overflow
};

std::expected<int, DomainError> parse_reading(std::string_view raw) {
    if (raw.empty()) {
        return std::unexpected(DomainError::EmptyPayload);
    }
    int value = 0;
    for (char c : raw) {
        if (c < '0' || c > '9') {
            return std::unexpected(DomainError::InvalidRange);
        }
        value = value * 10 + (c - '0');
    }
    return value;
}

int main() {
    std::vector<std::string_view> inputs = {"10", "invalid", "42", "0"};
    namespace views = std::views;

    for (std::string_view item : inputs) {
        auto result = parse_reading(item);
        if (result) {
            std::cout << "Value: " << *result << '\n';
        }
    }
    return 0;
}
