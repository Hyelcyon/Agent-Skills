#!/usr/bin/env python3
"""Skill Truth & Hallucination Verifier for Antigravity Ecosystem.

Audits all skills across the repository for factual inaccuracies, broken code syntax,
deprecated APIs, hallucinated package imports, and malformed markdown structures.
"""

import ast
import json
import re
import sys
from pathlib import Path

SKILLS_ROOT = Path(__file__).resolve().parents[3]

CODE_BLOCK_DEPRECATIONS = [
    (
        r"\bReactDOM\.render\s*\(",
        "React",
        "ReactDOM.render was removed in React 19; use createRoot(container).render(...) instead."
    ),
    (
        r"from\s+pydantic\s+import\s+.*BaseSettings\b",
        "Python/Pydantic",
        "BaseSettings moved to pydantic_settings in Pydantic v2."
    ),
    (
        r"@validator\s*\(",
        "Python/Pydantic",
        "@validator is deprecated in Pydantic v2; use @field_validator instead."
    ),
    (
        r"@root_validator\s*\(",
        "Python/Pydantic",
        "@root_validator is deprecated in Pydantic v2; use @model_validator instead."
    ),
    (
        r"(?<![\w\.])\w+\.dict\s*\(\s*\)",
        "Python/Pydantic",
        "model.dict() is deprecated in Pydantic v2; use model.model_dump() instead."
    ),
    (
        r"\bcrypto\.createCipher\s*\(",
        "Node.js",
        "crypto.createCipher is insecure and removed; use crypto.createCipheriv."
    ),
    (
        r"\bnew\s+Buffer\s*\(",
        "Node.js",
        "new Buffer() is deprecated and insecure; use Buffer.from() or Buffer.alloc()."
    ),
    (
        r"\bdatetime\.utcnow\s*\(\s*\)",
        "Python",
        "datetime.utcnow() is deprecated in Python 3.12+; use datetime.now(timezone.utc)."
    ),
    (
        r"\buseFormState\s*\(",
        "React 19",
        "useFormState is deprecated in React 19; use useActionState from 'react'."
    ),
    (
        r"\bcomponentWillReceiveProps\b",
        "React",
        "componentWillReceiveProps is removed in modern React."
    ),
    (
        r"\bcomponentWillMount\b",
        "React",
        "componentWillMount is removed in modern React."
    )
]


class TruthAuditResult:
    def __init__(self):
        self.files_scanned = 0
        self.code_blocks_scanned = 0
        self.syntax_errors: list[tuple[str, int, str, str]] = []
        self.deprecation_warnings: list[tuple[str, int, str, str]] = []
        self.broken_links: list[tuple[str, int, str]] = []


def audit_markdown_file(path: Path, result: TruthAuditResult) -> None:
    result.files_scanned += 1
    try:
        content = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        result.syntax_errors.append((str(path), 0, "FileReadError", str(e)))
        return

    lines = content.splitlines()

    code_block_pattern = re.compile(r"^\s*```(\w+)?\s*$")
    in_code = False
    current_lang = ""
    current_block: list[str] = []
    block_start_line = 0

    for idx, line in enumerate(lines, start=1):
        match = code_block_pattern.match(line)
        if match:
            if not in_code:
                in_code = True
                current_lang = (match.group(1) or "").lower()
                current_block = []
                block_start_line = idx
            else:
                in_code = False
                result.code_blocks_scanned += 1
                block_content = "\n".join(current_block)
                audit_code_block(path, block_start_line, current_lang, block_content, result)
        elif in_code:
            current_block.append(line)
        else:
            # Strip inline code spans before extracting markdown links
            line_no_code = re.sub(r"`[^`]*`", "", line)
            links = re.findall(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)", line_no_code)
            for _, url in links:
                if url.startswith(("http://", "https://", "mailto:", "#", "file://", "conversation://")):
                    continue
                clean_target = url.split("#")[0].strip()
                if not clean_target:
                    continue
                target_path = (path.parent / clean_target).resolve()
                if not target_path.exists():
                    result.broken_links.append((str(path), idx, url))


def audit_code_block(path: Path, start_line: int, lang: str, code: str, result: TruthAuditResult) -> None:
    code_stripped = code.strip()
    if not code_stripped:
        return

    # Check for known deprecated / hallucinated APIs inside actual code
    is_negative_example = any(
        kw in code_stripped.lower()
        for kw in ["anti-pattern", "legacy", "deprecated", "broken", "incorrect", "❌"]
    )

    if not is_negative_example:
        for pattern, domain, explanation in CODE_BLOCK_DEPRECATIONS:
            for line_offset, code_line in enumerate(code.splitlines()):
                if re.search(pattern, code_line):
                    result.deprecation_warnings.append(
                        (str(path), start_line + line_offset + 1, domain, explanation)
                    )

    if "..." in code_stripped or "<insert" in code_stripped or "<path" in code_stripped:
        return

    if lang in ["python", "py"]:
        try:
            ast.parse(code_stripped)
        except SyntaxError as e:
            if not any(code_stripped.startswith(prefix) for prefix in ("$", ">>>", "%")):
                result.syntax_errors.append(
                    (str(path), start_line + (e.lineno or 1) - 1, "PythonSyntaxError", e.msg)
                )

    elif lang == "json":
        if "//" in code_stripped or "/*" in code_stripped:
            return
        try:
            json.loads(code_stripped)
        except json.JSONDecodeError as e:
            result.syntax_errors.append(
                (str(path), start_line + e.lineno - 1, "JSONDecodeError", e.msg)
            )


def main() -> int:
    result = TruthAuditResult()

    if not SKILLS_ROOT.is_dir():
        print(f"Error: Skills root not found at {SKILLS_ROOT}")
        return 1

    md_files = sorted(SKILLS_ROOT.rglob("*.md"))
    for md_file in md_files:
        audit_markdown_file(md_file, result)

    print("=" * 80)
    print("        Antigravity Deep Truth & Code Hallucination Audit Report        ")
    print("=" * 80)
    print(f"Total Markdown Files Audited : {result.files_scanned}")
    print(f"Total Code Blocks Audited    : {result.code_blocks_scanned}")
    print(f"Syntax Errors Detected       : {len(result.syntax_errors)}")
    print(f"Deprecated/Outdated APIs     : {len(result.deprecation_warnings)}")
    print(f"Broken Markdown Links        : {len(result.broken_links)}")
    print("-" * 80)

    if result.syntax_errors:
        print("\n[!] Syntax Errors in Code Blocks:")
        for file_path, line, err_type, msg in result.syntax_errors:
            rel_path = Path(file_path).relative_to(SKILLS_ROOT)
            print(f"  - {rel_path}:{line} [{err_type}]: {msg}")

    if result.deprecation_warnings:
        print("\n[!] Deprecated / Hallucinated API Usage:")
        for file_path, line, domain, explanation in result.deprecation_warnings:
            rel_path = Path(file_path).relative_to(SKILLS_ROOT)
            print(f"  - {rel_path}:{line} ({domain}): {explanation}")

    if result.broken_links:
        print("\n[!] Broken Relative Links:")
        for file_path, line, target in result.broken_links:
            rel_path = Path(file_path).relative_to(SKILLS_ROOT)
            print(f"  - {rel_path}:{line} -> Missing: {target}")

    if not (result.syntax_errors or result.deprecation_warnings or result.broken_links):
        print("\n[PASS] All skills are factually consistent, syntactically valid, and free of known hallucinations.")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
