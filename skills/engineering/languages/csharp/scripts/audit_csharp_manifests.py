import sys
import argparse
import re
from pathlib import Path

def audit_csproj(content):
    issues = []
    if "<Nullable>enable</Nullable>" not in content:
        issues.append("Missing <Nullable>enable</Nullable>")
    if "<TreatWarningsAsErrors>true</TreatWarningsAsErrors>" not in content:
        issues.append("Missing <TreatWarningsAsErrors>true</TreatWarningsAsErrors>")
    return issues

def audit_cs_file(content):
    issues = []
    blocking_patterns = [
        (r'\.Result\b', "Blocking call '.Result' detected. Use 'await' instead."),
        (r'\.Wait\(\)', "Blocking call '.Wait()' detected. Use 'await' instead."),
        (r'\.GetAwaiter\(\)\.GetResult\(\)', "Blocking call '.GetAwaiter().GetResult()' detected. Use 'await' instead."),
        (r'Thread\.Sleep\(', "Blocking call 'Thread.Sleep' detected. Use 'await Task.Delay' instead."),
        (r'catch\s*\([^\)]*\)\s*\{\s*\}', "Empty catch block detected. Log or rethrow exceptions.")
    ]
    for pattern, message in blocking_patterns:
        matches = re.finditer(pattern, content)
        for m in matches:
            line_num = content[:m.start()].count('\n') + 1
            issues.append(f"Line {line_num}: {message}")
    return issues

def main():
    parser = argparse.ArgumentParser(description="Deterministic C# & .NET Quality Auditor")
    parser.add_argument("--path", "-p", required=True, help="Path to file or directory to audit")
    args = parser.parse_args()

    target = Path(args.path)
    if not target.exists():
        print(f"Target path does not exist: {target}")
        sys.exit(1)

    files_to_audit = [target] if target.is_file() else list(target.rglob("*"))
    total_issues = 0

    for file_path in files_to_audit:
        if file_path.suffix in (".csproj", ".props"):
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            issues = audit_csproj(content)
            if issues:
                total_issues += len(issues)
                print(f"[FAIL] {file_path}:")
                for issue in issues:
                    print(f"  - {issue}")
        elif file_path.suffix == ".cs":
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            issues = audit_cs_file(content)
            if issues:
                total_issues += len(issues)
                print(f"[FAIL] {file_path}:")
                for issue in issues:
                    print(f"  - {issue}")

    if total_issues == 0:
        print(f"[PASS] All checked C# assets in '{target}' comply with modern senior engineering standards.")
        sys.exit(0)
    else:
        print(f"\nAudit completed with {total_issues} violation(s).")
        sys.exit(1)

if __name__ == "__main__":
    main()
