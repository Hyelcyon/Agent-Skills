#include <iostream>
#include <memory>
#include <string>

class FileDescriptorHandle {
public:
    explicit FileDescriptorHandle(const std::string& path)
        : m_path(path), m_isOpen(true) {
    }

    ~FileDescriptorHandle() noexcept {
        close();
    }

    FileDescriptorHandle(const FileDescriptorHandle&) = delete;
    FileDescriptorHandle& operator=(const FileDescriptorHandle&) = delete;

    FileDescriptorHandle(FileDescriptorHandle&& other) noexcept
        : m_path(std::move(other.m_path)), m_isOpen(other.m_isOpen) {
        other.m_isOpen = false;
    }

    FileDescriptorHandle& operator=(FileDescriptorHandle&& other) noexcept {
        if (this != &other) {
            close();
            m_path = std::move(other.m_path);
            m_isOpen = other.m_isOpen;
            other.m_isOpen = false;
        }
        return *this;
    }

    [[nodiscard]] bool isOpen() const noexcept {
        return m_isOpen;
    }

    void close() noexcept {
        m_isOpen = false;
    }

private:
    std::string m_path;
    bool m_isOpen{false};
};
