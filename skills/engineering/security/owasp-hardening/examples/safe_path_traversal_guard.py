from pathlib import Path


def read_user_file_safely(base_dir_path: str, untrusted_filename: str) -> bytes:
    if "\x00" in untrusted_filename:
        raise ValueError("Null byte injection detected")

    base_dir = Path(base_dir_path).resolve()
    target_candidate = (base_dir / untrusted_filename).resolve()

    if not target_candidate.is_relative_to(base_dir):
        raise PermissionError("Path traversal attempt detected")

    if not target_candidate.exists():
        raise FileNotFoundError(f"File not found: {untrusted_filename}")

    if not target_candidate.is_file():
        raise PermissionError("Target is not a standard file")

    return target_candidate.read_bytes()
