import sys
import json
import urllib.request
import urllib.error

def fetch_component(component_name, lang="TS", style="TW"):
    variant = f"{component_name}-{lang}-{style}"
    url = f"https://reactbits.dev/r/{variant}"
    
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Antigravity-Agent/1.0"}
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
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python fetch_component.py <ComponentName> [TS|JS] [TW|CSS]\n")
        sys.exit(1)
        
    comp = sys.argv[1]
    l = sys.argv[2] if len(sys.argv) > 2 else "TS"
    s = sys.argv[3] if len(sys.argv) > 3 else "TW"
    
    exit_code = fetch_component(comp, l, s)
    sys.exit(exit_code)
