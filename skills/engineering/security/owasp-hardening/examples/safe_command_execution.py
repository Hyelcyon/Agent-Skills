import re
import subprocess
from typing import Final

SAFE_FILENAME_PATTERN: Final[re.Pattern[str]] = re.compile(r"^[a-zA-Z0-9_\-.]+$")

def convert_image_format(source_file: str, output_file: str, max_dimension: int = 1024) -> str:
    if not SAFE_FILENAME_PATTERN.match(source_file):
        raise ValueError("Invalid source filename")

    if not SAFE_FILENAME_PATTERN.match(output_file):
        raise ValueError("Invalid output filename")

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
