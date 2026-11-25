#!/usr/bin/env python3
"""Validate Codex SKILL.md compliance and optional agents/openai.yaml sidecar."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import yaml

VALID_NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
CLAUDE_ONLY_KEYS = {
    "disable-model-invocation",
    "user-invocable",
    "context",
    "agent",
    "argument-hint",
}


def validate_codex_skill(skill_md_path: Path) -> list[str]:
    errors: list[str] = []
    text = skill_md_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return ["Missing opening '---' YAML frontmatter"]

    parts = text.split("---", 2)
    if len(parts) < 3:
        return ["Unclosed YAML frontmatter block"]

    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as err:
        return [f"Invalid YAML frontmatter: {err}"]

    if not isinstance(meta, dict):
        return ["Frontmatter must be a YAML mapping"]

    leaked_claude = sorted(set(meta.keys()) & CLAUDE_ONLY_KEYS)
    if leaked_claude:
        errors.append(
            f"Claude-specific frontmatter keys belong in agents/openai.yaml, not Codex SKILL.md: {', '.join(leaked_claude)}"
        )

    name = meta.get("name")
    if not isinstance(name, str) or not VALID_NAME_RE.match(name) or len(name) > 64:
        errors.append("Invalid 'name' (must be 1..64 lowercase kebab-case characters)")
    elif skill_md_path.name == "SKILL.md" and name != skill_md_path.parent.name:
        errors.append(f"Skill name '{name}' does not match directory '{skill_md_path.parent.name}'")

    desc = meta.get("description")
    if not isinstance(desc, str) or not (10 <= len(desc.strip()) <= 1024):
        errors.append("Field 'description' must be 10..1024 characters")

    openai_yaml_path = skill_md_path.parent / "agents" / "openai.yaml"
    if openai_yaml_path.is_file():
        errors.extend(validate_openai_yaml(openai_yaml_path, expected_skill=name if isinstance(name, str) else None))

    return errors


def validate_openai_yaml(yaml_path: Path, expected_skill: str | None = None) -> list[str]:
    errors: list[str] = []
    try:
        data = yaml.safe_load(yaml_path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as err:
        return [f"Malformed agents/openai.yaml: {err}"]

    if not isinstance(data, dict):
        return ["agents/openai.yaml must deserialize to a mapping"]

    policy = data.get("policy")
    if policy is not None and (
        not isinstance(policy, dict)
        or ("allow_implicit_invocation" in policy and not isinstance(policy["allow_implicit_invocation"], bool))
    ):
        errors.append("policy.allow_implicit_invocation must be a boolean")

    iface = data.get("interface")
    if iface is not None:
        if not isinstance(iface, dict):
            errors.append("interface must be a mapping")
        else:
            color = iface.get("brand_color")
            if color is not None and (not isinstance(color, str) or not HEX_COLOR_RE.match(color)):
                errors.append(f"interface.brand_color '{color}' must match #RRGGBB")
            prompt = iface.get("default_prompt")
            if expected_skill and isinstance(prompt, str) and f"${expected_skill}" not in prompt:
                errors.append(f"interface.default_prompt must mention '${expected_skill}' explicitly")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Codex SKILL.md and optional agents/openai.yaml.")
    parser.add_argument("target", type=Path, help="Path to SKILL.md or openai.yaml file.")
    args = parser.parse_args()

    if not args.target.is_file():
        print(f"File not found: {args.target}", file=sys.stderr)
        return 1

    issues = (
        validate_openai_yaml(args.target)
        if args.target.name.endswith((".yaml", ".yml"))
        else validate_codex_skill(args.target)
    )
    if issues:
        for issue in issues:
            print(f"[FAIL] {issue}")
        return 1

    print(f"[PASS] {args.target} conforms to Codex skill rules.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
