import json
import re
import sys
import urllib.error
import urllib.request

VALID_COMPONENT_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
ALLOWED_LANGS = frozenset({"TS", "JS"})
ALLOWED_STYLES = frozenset({"TW", "CSS"})


def fetch_component(component_name: str, lang: str = "TS", style: str = "TW") -> int:
    if not VALID_COMPONENT_RE.fullmatch(component_name):
        sys.stderr.write(f"Error: Invalid component name '{component_name}'.\n")
        return 1
    if lang not in ALLOWED_LANGS or style not in ALLOWED_STYLES:
        sys.stderr.write(f"Error: Expected lang in {sorted(ALLOWED_LANGS)} and style in {sorted(ALLOWED_STYLES)}.\n")
        return 1

    variant = f"{component_name}-{lang}-{style}"
    url = f"https://reactbits.dev/r/{variant}"

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Antigravity-Agent/1.0"},
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode("utf-8")
            try:
                data = json.loads(content)
                print(json.dumps(data, indent=2))
            except json.JSONDecodeError:
                print(content)
            return 0
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP Error {e.code}: Could not fetch component '{variant}' from {url}\n")
        return 1
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeDecodeError) as e:
        sys.stderr.write(f"Error: {e}\n")
        return 1


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python fetch_component.py <ComponentName> [TS|JS] [TW|CSS]\n")
        sys.exit(1)

    comp = sys.argv[1]
    lang_arg = sys.argv[2] if len(sys.argv) > 2 else "TS"
    style_arg = sys.argv[3] if len(sys.argv) > 3 else "TW"

    sys.exit(fetch_component(comp, lang_arg, style_arg))
