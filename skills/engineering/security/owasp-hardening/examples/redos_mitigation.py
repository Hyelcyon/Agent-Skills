import concurrent.futures
import re
from typing import Final

MAX_INPUT_LENGTH: Final[int] = 512

SAFE_USERNAME_PATTERN: Final[re.Pattern[str]] = re.compile(r"^[a-zA-Z0-9_\-]{3,32}$")
SAFE_EMAIL_PATTERN: Final[re.Pattern[str]] = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

def evaluate_regex_with_boundary(pattern: re.Pattern[str], candidate: str) -> bool:
    if len(candidate) > MAX_INPUT_LENGTH:
        raise ValueError(f"Input exceeds maximum allowed length of {MAX_INPUT_LENGTH}")
    return bool(pattern.fullmatch(candidate))

def match_with_timeout(pattern: re.Pattern[str], candidate: str, timeout_seconds: float = 0.2) -> bool:
    if len(candidate) > MAX_INPUT_LENGTH:
        raise ValueError("Input exceeds safe regex length threshold")

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(pattern.fullmatch, candidate)
        try:
            result = future.result(timeout=timeout_seconds)
            return result is not None
        except concurrent.futures.TimeoutError as err:
            raise TimeoutError("Regular expression evaluation timed out") from err
