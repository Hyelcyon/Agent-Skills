#!/usr/bin/env python3
"""Validate Claude Code SKILL.md frontmatter rules and detect invocation deadlocks."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import yaml

VALID_NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
KNOWN_CLAUDE_KEYS = {
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "argument-hint",
    "disable-model-invocation",
    "user-invocable",
    "allowed-tools",
    "model",
    "effort",
    "context",
    "agent",
    "paths",
    "hooks",
}


def validate_claude_skill(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return ["Missing opening '---' YAML frontmatter"]

    parts = text.split("---", 2)
    if len(parts) < 3:
        return ["Unclosed YAML frontmatter block"]

    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as err:
        return [f"Malformed YAML frontmatter: {err}"]

    if not isinstance(meta, dict):
        return ["Frontmatter must be a YAML mapping"]

    unknown_keys = sorted(set(meta.keys()) - KNOWN_CLAUDE_KEYS)
    if unknown_keys:
        errors.append(f"Unsupported Claude frontmatter keys: {', '.join(unknown_keys)}")

    name = meta.get("name")
    if not isinstance(name, str) or not VALID_NAME_RE.match(name) or len(name) > 64:
        errors.append("Invalid 'name' (must be 1..64 lowercase kebab-case characters)")
    elif path.name == "SKILL.md" and name != path.parent.name:
        errors.append(f"Skill name '{name}' does not match parent folder '{path.parent.name}'")

    desc = meta.get("description")
    if not isinstance(desc, str) or not (10 <= len(desc.strip()) <= 1024):
        errors.append("Field 'description' must be 10..1024 characters")

    disable_model = meta.get("disable-model-invocation", False)
    user_invocable = meta.get("user-invocable", True)
    if disable_model is True and user_invocable is False:
        errors.append(
            "Unreachable skill: disable-model-invocation=true combined with user-invocable=false blocks all invocation"
        )

    if "agent" in meta and meta.get("context") != "fork":
        errors.append("Field 'agent' has no effect unless 'context: fork' is set")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Claude Code SKILL.md file.")
    parser.add_argument("target", type=Path, help="Path to SKILL.md or markdown file with YAML frontmatter.")
    args = parser.parse_args()

    if not args.target.is_file():
        print(f"File not found: {args.target}", file=sys.stderr)
        return 1

    issues = validate_claude_skill(args.target)
    if issues:
        for issue in issues:
            print(f"[FAIL] {issue}")
        return 1

    print(f"[PASS] {args.target} conforms to Claude Code skill rules.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
