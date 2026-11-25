#!/usr/bin/env python3
"""Skill Truth, Frontmatter, Discovery & Code Hallucination Verifier."""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path

import yaml

SKILLS_ROOT = Path(__file__).resolve().parents[3]
CONFIG_ROOT = SKILLS_ROOT.parent
VALID_SKILL_NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

CODE_BLOCK_DEPRECATIONS = [
    (
        r"\bReactDOM\.render\s*\(",
        "React",
        "ReactDOM.render was removed in React 19; use createRoot(container).render(...) instead.",
    ),
    (
        r"from\s+pydantic\s+import\s+.*BaseSettings\b",
        "Python/Pydantic",
        "BaseSettings moved to pydantic_settings in Pydantic v2.",
    ),
    (
        r"@validator\s*\(",
        "Python/Pydantic",
        "@validator is deprecated in Pydantic v2; use @field_validator instead.",
    ),
    (
        r"@root_validator\s*\(",
        "Python/Pydantic",
        "@root_validator is deprecated in Pydantic v2; use @model_validator instead.",
    ),
    (
        r"(?<![\w\.])\w+\.dict\s*\(\s*\)",
        "Python/Pydantic",
        "model.dict() is deprecated in Pydantic v2; use model.model_dump() instead.",
    ),
    (
        r"\bcrypto\.createCipher\s*\(",
        "Node.js",
        "crypto.createCipher is insecure and removed; use crypto.createCipheriv.",
    ),
    (
        r"\bnew\s+Buffer\s*\(",
        "Node.js",
        "new Buffer() is deprecated and insecure; use Buffer.from() or Buffer.alloc().",
    ),
    (
        r"\bdatetime\.utcnow\s*\(\s*\)",
        "Python",
        "datetime.utcnow() is deprecated in Python 3.12+; use datetime.now(timezone.utc).",
    ),
    (
        r"\buseFormState\s*\(",
        "React 19",
        "useFormState is deprecated in React 19; use useActionState from 'react'.",
    ),
    (
        r"\bcomponentWillReceiveProps\b",
        "React",
        "componentWillReceiveProps is removed in modern React.",
    ),
    (
        r"\bcomponentWillMount\b",
        "React",
        "componentWillMount is removed in modern React.",
    ),
]


class TruthAuditResult:
    def __init__(self) -> None:
        self.files_scanned = 0
        self.code_blocks_scanned = 0
        self.syntax_errors: list[tuple[str, int, str, str]] = []
        self.deprecation_warnings: list[tuple[str, int, str, str]] = []
        self.broken_links: list[tuple[str, int, str]] = []
        self.frontmatter_errors: list[tuple[str, str]] = []
        self.manifest_errors: list[tuple[str, str]] = []


def validate_skill_frontmatter(skill_md_path: Path, content: str, result: TruthAuditResult) -> None:
    if not content.startswith("---"):
        result.frontmatter_errors.append((str(skill_md_path), "Missing opening YAML frontmatter delimiter '---'"))
        return

    parts = content.split("---", 2)
    if len(parts) < 3:
        result.frontmatter_errors.append((str(skill_md_path), "Unclosed YAML frontmatter block"))
        return

    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as err:
        result.frontmatter_errors.append((str(skill_md_path), f"Invalid YAML frontmatter: {err}"))
        return

    if not isinstance(meta, dict):
        result.frontmatter_errors.append((str(skill_md_path), "Frontmatter must deserialize to a YAML mapping"))
        return

    name = meta.get("name")
    desc = meta.get("description")
    expected_dir = skill_md_path.parent.name

    if not isinstance(name, str) or not name:
        result.frontmatter_errors.append((str(skill_md_path), "Missing required string field 'name'"))
    else:
        if len(name) > 64 or not VALID_SKILL_NAME_RE.match(name):
            result.frontmatter_errors.append(
                (str(skill_md_path), f"Invalid skill name '{name}' (must be <= 64 chars lowercase kebab-case)")
            )
        if name != expected_dir:
            result.frontmatter_errors.append(
                (str(skill_md_path), f"Frontmatter name '{name}' does not match directory '{expected_dir}'")
            )

    if not isinstance(desc, str) or len(desc.strip()) < 10:
        result.frontmatter_errors.append((str(skill_md_path), "Missing or too-short 'description' field"))
    elif len(desc.strip()) > 1024:
        result.frontmatter_errors.append(
            (str(skill_md_path), f"Description exceeds 1024-char limit ({len(desc.strip())})")
        )


def validate_manifests(result: TruthAuditResult) -> None:
    for rel_manifest in ("skills.json", ".agents/skills.json"):
        manifest_path = CONFIG_ROOT / rel_manifest
        if not manifest_path.is_file():
            continue
        try:
            data = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as err:
            result.manifest_errors.append((rel_manifest, f"Invalid JSON: {err}"))
            continue

        entries = data.get("entries", [])
        if not isinstance(entries, list):
            result.manifest_errors.append((rel_manifest, "'entries' must be an array"))
            continue

        for item in entries:
            raw_path = item.get("path") if isinstance(item, dict) else None
            if not isinstance(raw_path, str) or not raw_path.strip():
                result.manifest_errors.append((rel_manifest, f"Malformed entry without valid 'path': {item}"))
                continue
            resolved = (CONFIG_ROOT / raw_path).resolve()
            if not resolved.exists():
                result.manifest_errors.append((rel_manifest, f"Entry path does not exist: {raw_path}"))


def audit_markdown_file(path: Path, result: TruthAuditResult) -> None:
    result.files_scanned += 1
    try:
        content = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        result.syntax_errors.append((str(path), 0, "FileReadError", str(e)))
        return

    if path.name == "SKILL.md":
        validate_skill_frontmatter(path, content, result)

    lines = content.splitlines()
    code_block_pattern = re.compile(r"^\s*```([A-Za-z0-9_+-]+)?\s*$")
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
                preceding_prose = "\n".join(lines[max(0, block_start_line - 4) : max(0, block_start_line - 1)])
                audit_code_block(path, block_start_line, current_lang, block_content, preceding_prose, result)
        elif in_code:
            current_block.append(line)
        else:
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


def audit_code_block(
    path: Path,
    start_line: int,
    lang: str,
    code: str,
    preceding_prose: str,
    result: TruthAuditResult,
) -> None:
    code_stripped = code.strip()
    if not code_stripped:
        return

    neg_keywords = ("anti-pattern", "legacy", "deprecated", "broken", "incorrect", "bad:", "❌", "do not use")
    combined_ctx = f"{preceding_prose}\n{code_stripped}".lower()
    is_negative_example = any(kw in combined_ctx for kw in neg_keywords)

    if not is_negative_example:
        for pattern, domain, explanation in CODE_BLOCK_DEPRECATIONS:
            for line_offset, code_line in enumerate(code.splitlines()):
                if re.search(pattern, code_line):
                    result.deprecation_warnings.append(
                        (str(path), start_line + line_offset + 1, domain, explanation)
                    )

    if "..." in code_stripped or "<insert" in code_stripped or "<path" in code_stripped:
        return

    if lang in ("python", "py"):
        try:
            ast.parse(code_stripped)
        except SyntaxError as e:
            if not any(code_stripped.startswith(prefix) for prefix in ("$", ">>>", "%")):
                result.syntax_errors.append(
                    (str(path), start_line + (e.lineno or 1) - 1, "PythonSyntaxError", e.msg or "SyntaxError")
                )
    elif lang == "json":
        if "//" in code_stripped or "/*" in code_stripped or "<" in code_stripped:
            return
        try:
            json.loads(code_stripped)
        except json.JSONDecodeError as e:
            result.syntax_errors.append(
                (str(path), start_line + e.lineno - 1, "JSONDecodeError", e.msg)
            )


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify Antigravity skills frontmatter, manifests, links, and code blocks.")
    parser.add_argument("--skills-root", type=Path, default=SKILLS_ROOT, help="Root skills directory to audit.")
    args = parser.parse_args()

    result = TruthAuditResult()
    skills_root: Path = args.skills_root

    if not skills_root.is_dir():
        print(f"Error: Skills root not found at {skills_root}", file=sys.stderr)
        return 1

    validate_manifests(result)
    for md_file in sorted(skills_root.rglob("*.md")):
        audit_markdown_file(md_file, result)

    print("=" * 80)
    print("        Antigravity Deep Truth & Code Hallucination Audit Report        ")
    print("=" * 80)
    print(f"Total Markdown Files Audited : {result.files_scanned}")
    print(f"Total Code Blocks Audited    : {result.code_blocks_scanned}")
    print(f"Manifest Errors              : {len(result.manifest_errors)}")
    print(f"Frontmatter Errors           : {len(result.frontmatter_errors)}")
    print(f"Syntax Errors Detected       : {len(result.syntax_errors)}")
    print(f"Deprecated/Outdated APIs     : {len(result.deprecation_warnings)}")
    print(f"Broken Markdown Links        : {len(result.broken_links)}")
    print("-" * 80)

    if result.manifest_errors:
        print("\n[!] Discovery Manifest Errors:")
        for m, msg in result.manifest_errors:
            print(f"  - {m}: {msg}")

    if result.frontmatter_errors:
        print("\n[!] Frontmatter Validation Errors:")
        for fp, msg in result.frontmatter_errors:
            print(f"  - {Path(fp).relative_to(skills_root)}: {msg}")

    if result.syntax_errors:
        print("\n[!] Syntax Errors in Code Blocks:")
        for fp, line, err_type, msg in result.syntax_errors:
            print(f"  - {Path(fp).relative_to(skills_root)}:{line} [{err_type}]: {msg}")

    if result.deprecation_warnings:
        print("\n[!] Deprecated / Hallucinated API Usage:")
        for fp, line, domain, exp in result.deprecation_warnings:
            print(f"  - {Path(fp).relative_to(skills_root)}:{line} ({domain}): {exp}")

    if result.broken_links:
        print("\n[!] Broken Relative Links:")
        for fp, line, target in result.broken_links:
            print(f"  - {Path(fp).relative_to(skills_root)}:{line} -> Missing: {target}")

    has_failures = any(
        (
            result.manifest_errors,
            result.frontmatter_errors,
            result.syntax_errors,
            result.deprecation_warnings,
            result.broken_links,
        )
    )
    if not has_failures:
        print("\n[PASS] All skills, manifests, and code blocks passed structural and truth verification.")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
