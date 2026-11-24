#include <concepts>
#include <iostream>
#include <string>
#include <type_traits>

template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <typename T>
concept PrintableEntity = requires(T entity) {
    { entity.getName() } -> std::convertible_to<std::string>;
};

template <Numeric T>
[[nodiscard]] constexpr T calculatePower(T base, unsigned int exponent) noexcept {
    T result = 1;
    for (unsigned int i = 0; i < exponent; ++i) {
        result *= base;
    }
    return result;
}

class ServiceRecord {
public:
    explicit ServiceRecord(std::string name) : m_name(std::move(name)) {}
    [[nodiscard]] std::string getName() const { return m_name; }
private:
    std::string m_name;
};

template <PrintableEntity T>
void logEntityName(const T& entity) {
    std::cout << entity.getName() << '\n';
}
