import ipaddress
import socket
import ssl
from urllib.parse import urlparse

def is_safe_public_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
        if str(ip) == "169.254.169.254":
            return False
        return True
    except ValueError:
        return False

def fetch_url_with_ip_pinning(target_url: str, timeout_seconds: float = 5.0) -> tuple[int, bytes]:
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
        resolved_ip = entry[4][0]
        if not is_safe_public_ip(resolved_ip):
            raise PermissionError(f"Blocked SSRF attempt to non-public IP: {resolved_ip}")

    pinned_ip = addr_info[0][4][0]

    raw_socket = socket.create_connection((pinned_ip, port), timeout=timeout_seconds)
    ssl_context = ssl.create_default_context()

    with ssl_context.wrap_socket(raw_socket, server_hostname=hostname) as tls_socket:
        path = parsed.path if parsed.path else "/"
        if parsed.query:
            path += f"?{parsed.query}"

        request_payload = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {hostname}\r\n"
            f"User-Agent: SecurePythonAgent/1.0\r\n"
            f"Connection: close\r\n\r\n"
        ).encode("utf-8")

        tls_socket.sendall(request_payload)

        response_chunks = []
        while True:
            chunk = tls_socket.recv(4096)
            if not chunk:
                break
            response_chunks.append(chunk)

    raw_response = b"".join(response_chunks)
    header_part, _, body_part = raw_response.partition(b"\r\n\r\n")

    status_line = header_part.split(b"\r\n")[0].decode("latin1", errors="replace")
    status_code = int(status_line.split(" ")[1]) if len(status_line.split(" ")) > 1 else 500

    return status_code, body_part
