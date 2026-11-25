import hashlib
import hmac

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

def secure_token_compare(provided_token: str, expected_token: str) -> bool:
    hash_a = hashlib.sha256(provided_token.encode("utf-8")).digest()
    hash_b = hashlib.sha256(expected_token.encode("utf-8")).digest()
    return hmac.compare_digest(hash_a, hash_b)

def hash_password_securely(raw_password: str) -> str:
    return hasher.hash(raw_password)

def verify_password_securely(stored_hash: str, candidate_password: str) -> bool:
    try:
        return hasher.verify(stored_hash, candidate_password)
    except VerifyMismatchError:
        return False
