import argparse
import re
import sys
from pathlib import Path

IGNORED_DIRS = frozenset({"bin", "obj", ".git", ".vs", "node_modules"})

BLOCKING_PATTERNS: tuple[tuple[str, str], ...] = (
    (r"\.Result\b", "Blocking call '.Result' detected. Use 'await' instead."),
    (r"\.Wait\(\)", "Blocking call '.Wait()' detected. Use 'await' instead."),
    (
        r"\.GetAwaiter\(\)\.GetResult\(\)",
        "Blocking call '.GetAwaiter().GetResult()' detected. Use 'await' instead.",
    ),
    (r"\bThread\.Sleep\(", "Blocking call 'Thread.Sleep' detected. Use 'await Task.Delay' instead."),
    (
        r"\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}",
        "Empty catch block detected. Log or rethrow exceptions.",
    ),
)


def _strip_cs_comments(content: str) -> str:
    """Replace comments with spaces while preserving line numbers."""
    pattern = re.compile(r"//[^\n]*|/\*[\s\S]*?\*/")
    return pattern.sub(lambda m: "\n" * m.group(0).count("\n"), content)


def audit_csproj(content: str, *, inherited_strict: bool = False) -> list[str]:
    """Verify strict nullable and warning-as-error MSBuild settings."""
    issues: list[str] = []
    if "<Nullable>disable</Nullable>" in content:
        issues.append("Explicit <Nullable>disable</Nullable> weakens null safety.")
    elif not inherited_strict and "<Nullable>enable</Nullable>" not in content:
        issues.append("Missing <Nullable>enable</Nullable>")

    if "<TreatWarningsAsErrors>false</TreatWarningsAsErrors>" in content:
        issues.append("Explicit <TreatWarningsAsErrors>false</TreatWarningsAsErrors> suppresses warnings.")
    elif not inherited_strict and "<TreatWarningsAsErrors>true</TreatWarningsAsErrors>" not in content:
        issues.append("Missing <TreatWarningsAsErrors>true</TreatWarningsAsErrors>")

    return issues


def audit_cs_file(content: str) -> list[str]:
    """Scan C# source outside comments for blocking async calls and empty catch blocks."""
    issues: list[str] = []
    code_only = _strip_cs_comments(content)
    for pattern, message in BLOCKING_PATTERNS:
        for match in re.finditer(pattern, code_only):
            line_num = code_only[: match.start()].count("\n") + 1
            issues.append(f"Line {line_num}: {message}")
    return issues


def _has_strict_props(search_root: Path) -> bool:
    for props_file in search_root.rglob("Directory.Build.props"):
        if any(part in IGNORED_DIRS for part in props_file.parts):
            continue
        text = props_file.read_text(encoding="utf-8", errors="ignore")
        if "<Nullable>enable</Nullable>" in text and "<TreatWarningsAsErrors>true</TreatWarningsAsErrors>" in text:
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Deterministic C# & .NET Quality Auditor")
    parser.add_argument("--path", "-p", required=True, help="Path to file or directory to audit")
    args = parser.parse_args()

    target = Path(args.path)
    if not target.exists():
        print(f"Target path does not exist: {target}")
        sys.exit(1)

    if target.is_file():
        files_to_audit = [target]
        inherited_strict = False
    else:
        files_to_audit = [
            p for p in sorted(target.rglob("*")) if p.is_file() and not any(part in IGNORED_DIRS for part in p.parts)
        ]
        inherited_strict = _has_strict_props(target)

    total_issues = 0
    for file_path in files_to_audit:
        if file_path.suffix == ".props":
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            issues = audit_csproj(content, inherited_strict=False)
        elif file_path.suffix == ".csproj":
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            issues = audit_csproj(content, inherited_strict=inherited_strict)
        elif file_path.suffix == ".cs":
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            issues = audit_cs_file(content)
        else:
            continue

        if issues:
            total_issues += len(issues)
            print(f"[FAIL] {file_path}:")
            for issue in issues:
                print(f"  - {issue}")

    if total_issues == 0:
        print(f"[PASS] All checked C# assets in '{target}' comply with modern senior engineering standards.")
        sys.exit(0)

    print(f"\nAudit completed with {total_issues} violation(s).")
    sys.exit(1)


if __name__ == "__main__":
    main()
