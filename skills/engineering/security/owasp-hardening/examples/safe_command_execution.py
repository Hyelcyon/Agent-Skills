import re
import subprocess
from typing import Final

# Disallow leading '-' option injection and '..' traversal segments
SAFE_FILENAME_PATTERN: Final[re.Pattern[str]] = re.compile(r"^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$")


def _validate_filename(name: str, label: str) -> None:
    if not SAFE_FILENAME_PATTERN.match(name) or ".." in name:
        raise ValueError(f"Invalid {label} filename")


def convert_image_format(source_file: str, output_file: str, max_dimension: int = 1024) -> str:
    _validate_filename(source_file, "source")
    _validate_filename(output_file, "output")

    bounded_dim = max(64, min(max_dimension, 4096))
    dim_arg = f"{bounded_dim}x{bounded_dim}>"

    command = [
        "magick",
        source_file,
        "-resize",
        dim_arg,
        output_file,
    ]

    result = subprocess.run(
        command,
        shell=False,
        check=True,
        capture_output=True,
        text=True,
        timeout=15,
    )

    return result.stdout
