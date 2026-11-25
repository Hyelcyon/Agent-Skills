import ipaddress
import socket
import ssl
from urllib.parse import urlparse

MAX_RESPONSE_BYTES = 5 * 1024 * 1024


def is_safe_public_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
            # Unwrap ::ffff:127.0.0.1 style addresses so IPv4 private/metadata checks apply
            ip = ip.ipv4_mapped
        if (
            not ip.is_global
            or ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            return False
        return str(ip) != "169.254.169.254"
    except ValueError:
        return False


def fetch_url_with_ip_pinning(
    target_url: str,
    timeout_seconds: float = 5.0,
    max_response_bytes: int = MAX_RESPONSE_BYTES,
) -> tuple[int, bytes]:
    parsed = urlparse(target_url)

    if parsed.scheme != "https":
        raise ValueError("Only HTTPS scheme is allowed")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid target hostname")

    port = parsed.port or 443

    addr_info = socket.getaddrinfo(hostname, port, proto=socket.IPPROTO_TCP)
    if not addr_info:
        raise ConnectionError("DNS resolution returned no records")

    for entry in addr_info:
        resolved_ip = str(entry[4][0])
        if not is_safe_public_ip(resolved_ip):
            raise PermissionError(f"Blocked SSRF attempt to non-public IP: {resolved_ip}")

    pinned_ip = str(addr_info[0][4][0])

    raw_socket = socket.create_connection((pinned_ip, port), timeout=timeout_seconds)
    ssl_context = ssl.create_default_context()

    try:
        wrapped = ssl_context.wrap_socket(raw_socket, server_hostname=hostname)
    except Exception:
        raw_socket.close()
        raise

    with wrapped as tls_socket:
        path = parsed.path if parsed.path else "/"
        if parsed.query:
            path += f"?{parsed.query}"

        request_payload = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {hostname}\r\n"
            f"User-Agent: SecurePythonAgent/1.0\r\n"
            f"Connection: close\r\n\r\n"
        ).encode()

        tls_socket.sendall(request_payload)

        response_chunks: list[bytes] = []
        total_bytes = 0
        while True:
            chunk = tls_socket.recv(4096)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_response_bytes:
                raise ValueError(f"Response exceeds byte limit ({max_response_bytes} bytes)")
            response_chunks.append(chunk)

    raw_response = b"".join(response_chunks)
    header_part, _, body_part = raw_response.partition(b"\r\n\r\n")

    status_line = header_part.split(b"\r\n")[0].decode("latin1", errors="replace")
    parts = status_line.split(" ")
    status_code = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 500
    if 300 <= status_code < 400:
        raise PermissionError(f"Blocked unvalidated HTTP redirect ({status_code}); re-validate destination before following")

    return status_code, body_part
