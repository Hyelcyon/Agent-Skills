#include <expected>
#include <iostream>
#include <ranges>
#include <string_view>
#include <vector>

enum class DomainError {
    EmptyPayload,
    InvalidRange,
    Overflow
};

std::expected<int, DomainError> parse_reading(std::string_view raw) noexcept {
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
    const std::vector<std::string_view> inputs = {"10", "invalid", "42", "0"};

    auto valid_readings = inputs
        | std::views::transform(parse_reading)
        | std::views::filter([](const auto& res) { return res.has_value(); })
        | std::views::transform([](const auto& res) { return *res; });

    for (int value : valid_readings) {
        std::cout << "Value: " << value << '\n';
    }
    return 0;
}
