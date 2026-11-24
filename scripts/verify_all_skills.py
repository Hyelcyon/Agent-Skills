import ast
import json
import re
import sys
from pathlib import Path

SKILLS_ROOT = Path(r"C:\dev\tools\antigravity-skills\skills")

FRAMEWORK_SKILLS = {"react", "vue", "angular", "svelte", "nodejs", "nextjs"}

CODE_DEPRECATIONS = [
    (r"\bReactDOM\.render\s*\(", "React 19", "ReactDOM.render removed; use createRoot"),
    (r"from\s+pydantic\s+import\s+.*BaseSettings\b", "Pydantic v2", "BaseSettings moved to pydantic_settings"),
    (r"@validator\s*\(", "Pydantic v2", "@validator deprecated; use @field_validator"),
    (r"@root_validator\s*\(", "Pydantic v2", "@root_validator deprecated; use @model_validator"),
    (r"(?<![\w\.])\w+\.dict\s*\(\s*\)", "Pydantic v2", "model.dict() deprecated; use model.model_dump()"),
    (r"\bcrypto\.createCipher\s*\(", "Node.js", "crypto.createCipher insecure; use crypto.createCipheriv"),
    (r"\bnew\s+Buffer\s*\(", "Node.js", "new Buffer() insecure; use Buffer.from/alloc"),
    (r"\bdatetime\.utcnow\s*\(\s*\)", "Python 3.12+", "datetime.utcnow deprecated; use datetime.now(timezone.utc)"),
    (r"\buseFormState\s*\(", "React 19", "useFormState deprecated; use useActionState"),
]

class SkillAudit:
    def __init__(self, skill_dir: Path):
        self.skill_dir = skill_dir
        self.name = skill_dir.name
        self.skill_md = skill_dir / "SKILL.md"
        self.errors = []
        self.warnings = []
        self.ref_count = 0
        self.ex_count = 0
        self.res_count = 0
        self.code_blocks = 0

    def audit(self):
        if not self.skill_md.exists():
            self.errors.append("Missing SKILL.md")
            return

        # 1. Frontmatter
        content = self.skill_md.read_text(encoding="utf-8")
        lines = content.splitlines()
        if not lines or lines[0].strip() != "---":
            self.errors.append("SKILL.md does not start with --- frontmatter")
        
        has_name = any(re.match(r"^name:\s*\S+", l) for l in lines)
        has_desc = any(re.match(r'^description:\s*"?Use when\b', l) for l in lines)
        has_5p = any("5-Phase" in l or "Operational Protocol" in l for l in lines)

        if not has_name:
            self.errors.append("Missing 'name:' in frontmatter")
        if not has_desc:
            self.errors.append("Description does not start with 'Use when...'")
        if not has_5p:
            self.errors.append("Missing 5-Phase Operational Protocol")

        # 2. Quotas
        ref_dir = self.skill_dir / "references"
        ex_dir = self.skill_dir / "examples"
        res_dir = self.skill_dir / "resources"

        self.ref_count = len(list(ref_dir.glob("*.md"))) if ref_dir.exists() else 0
        self.ex_count = len([x for x in ex_dir.iterdir() if x.is_file()]) if ex_dir.exists() else 0
        self.res_count = len([x for x in res_dir.iterdir() if x.is_file()]) if res_dir.exists() else 0

        target_refs = 7 if self.name in FRAMEWORK_SKILLS else 3
        if self.ref_count < target_refs:
            self.errors.append(f"Insufficient references: {self.ref_count}/{target_refs}")
        if self.ex_count < 3:
            self.errors.append(f"Insufficient examples: {self.ex_count}/3")
        if self.res_count < 3:
            self.errors.append(f"Insufficient resources: {self.res_count}/3")

        # 3. Check all markdown files in skill for links and code
        for md_path in self.skill_dir.rglob("*.md"):
            self.audit_markdown(md_path)

    def audit_markdown(self, md_path: Path):
        try:
            content = md_path.read_text(encoding="utf-8")
        except Exception as e:
            self.errors.append(f"Failed to read {md_path.name}: {e}")
            return

        lines = content.splitlines()
        in_code = False
        lang = ""
        block_lines = []

        for line in lines:
            m = re.match(r"^\s*```(\w+)?", line)
            if m:
                if not in_code:
                    in_code = True
                    lang = (m.group(1) or "").lower()
                    block_lines = []
                else:
                    in_code = False
                    self.code_blocks += 1
                    self.audit_code("\n".join(block_lines), lang, md_path)
            elif in_code:
                block_lines.append(line)
            else:
                # check relative links
                line_clean = re.sub(r"`[^`]*`", "", line)
                for _, target in re.findall(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)", line_clean):
                    if target.startswith(("http", "mailto", "#", "file:", "conversation:")):
                        continue
                    clean_target = target.split("#")[0].strip()
                    if not clean_target:
                        continue
                    resolved = (md_path.parent / clean_target).resolve()
                    if not resolved.exists():
                        self.errors.append(f"Broken link in {md_path.name}: {target}")

    def audit_code(self, code: str, lang: str, file_path: Path):
        code_lower = code.lower()
        is_anti_example = any(kw in code_lower for kw in ["anti-pattern", "legacy", "deprecated", "❌", "broken", "incorrect"])
        if not is_anti_example:
            for pattern, dom, exp in CODE_DEPRECATIONS:
                if re.search(pattern, code):
                    self.warnings.append(f"Deprecated {dom} in {file_path.name}: {exp}")

        if "..." in code or "<path" in code or "<insert" in code:
            return

        if lang in ("python", "py"):
            try:
                ast.parse(code)
            except SyntaxError as e:
                if not any(code.strip().startswith(p) for p in ("$", ">>>", "%")):
                    self.errors.append(f"Python syntax error in {file_path.name}: {e.msg}")
        elif lang == "json":
            if "//" not in code and "/*" not in code:
                try:
                    json.loads(code)
                except json.JSONDecodeError as e:
                    self.errors.append(f"JSON syntax error in {file_path.name}: {e.msg}")

def main():
    skill_dirs = [p.parent for p in SKILLS_ROOT.rglob("SKILL.md")]
    print(f"Discovered {len(skill_dirs)} skills to audit.\n")

    passed = 0
    failed = 0

    for s_dir in sorted(skill_dirs, key=lambda d: d.name):
        auditor = SkillAudit(s_dir)
        auditor.audit()

        status = "PASS" if not auditor.errors else "FAIL"
        rel_path = s_dir.relative_to(SKILLS_ROOT)

        if status == "PASS":
            passed += 1
            print(f"[OK] {auditor.name:<26} (refs: {auditor.ref_count}, ex: {auditor.ex_count}, res: {auditor.res_count}, code blocks: {auditor.code_blocks})")
        else:
            failed += 1
            print(f"[FAIL] {auditor.name:<26} ({rel_path})")
            for err in auditor.errors:
                print(f"   ERROR: {err}")

        for w in auditor.warnings:
            print(f"   WARN: {w}")

    print("\n" + "=" * 60)
    print(f"Audit Summary: {passed} PASSED, {failed} FAILED out of {len(skill_dirs)} skills")
    print("=" * 60)
    return 1 if failed > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
