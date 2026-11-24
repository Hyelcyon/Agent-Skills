#!/usr/bin/env bash
# Agent-Skills Multi-Agent Installer for Linux, macOS, and WSL
#
# Links Agent-Skills into Claude Code, OpenAI Codex, and Google Antigravity
# using zero-copy symlinks or junctions so `git pull` updates all skills in place.
#
# Usage:
#   ./install.sh                     # Auto-detect agents and link skills
#   ./install.sh --claude            # Link into Claude Code (~/.claude/skills)
#   ./install.sh --codex             # Link into OpenAI Codex (~/.codex/skills)
#   ./install.sh --antigravity       # Link into Google Antigravity (~/.gemini/config/skills)
#   ./install.sh --all-agents        # Link into all supported agents
#   ./install.sh --list              # List all available skills
#   ./install.sh --uninstall         # Remove links pointing to this repo

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$REPO_DIR/skills"

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "Error: Skills directory not found at $SKILLS_DIR" >&2
  exit 1
fi

targets=()
mode="install"
wanted=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude)      targets+=("$HOME/.claude/skills") ;;
    --codex)       targets+=("$HOME/.codex/skills") ;;
    --antigravity) targets+=("$HOME/.gemini/config/skills") ;;
    --all-agents)  targets+=("$HOME/.claude/skills" "$HOME/.codex/skills" "$HOME/.gemini/config/skills") ;;
    --list)        mode="list" ;;
    --uninstall)   mode="uninstall" ;;
    -h|--help)
      echo "Agent-Skills Installer"
      echo "Options: --claude, --codex, --antigravity, --all-agents, --list, --uninstall"
      exit 0 ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1 ;;
    *)
      wanted+=("$1") ;;
  esac
  shift
done

# Discover all skills
declare -A SKILL_PATHS
while IFS= read -r skill_md; do
  skill_folder="$(dirname "$skill_md")"
  skill_name="$(basename "$skill_folder")"

  # Extract frontmatter name if present
  fm_name=$(awk '
    NR==1 && $0!="---" { exit }
    NR>1 && /^---[[:space:]]*$/ { exit }
    NR>1 && /^name:/ { sub(/^name:[[:space:]]*/,""); gsub(/^["'\'']|["'\'']$/,""); print; exit }
  ' "$skill_md" || true)

  if [[ -n "$fm_name" ]]; then
    skill_name="$fm_name"
  fi
  SKILL_PATHS["$skill_name"]="$skill_folder"
done < <(find "$SKILLS_DIR" -type f -name "SKILL.md")

if [[ "$mode" == "list" ]]; then
  echo ""
  echo "=== Available Agent Skills (${#SKILL_PATHS[@]}) ==="
  for name in "${!SKILL_PATHS[@]}"; do
    rel="${SKILL_PATHS[$name]#$REPO_DIR/}"
    printf " - %-28s -> %s\n" "$name" "$rel"
  done
  echo ""
  exit 0
fi

# Auto-detect if no target specified
if [[ ${#targets[@]} -eq 0 ]]; then
  [[ -d "$HOME/.claude" ]] && targets+=("$HOME/.claude/skills")
  [[ -d "$HOME/.codex" ]] && targets+=("$HOME/.codex/skills")
  [[ -d "$HOME/.gemini" ]] && targets+=("$HOME/.gemini/config/skills")

  if [[ ${#targets[@]} -eq 0 ]]; then
    targets=("$HOME/.claude/skills" "$HOME/.gemini/config/skills")
  fi
fi

WINDOWS=0
case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*)
    WINDOWS=1
    export MSYS=winsymlinks:nativestrict CYGWIN=winsymlinks:nativestrict ;;
esac

make_link() {
  local src="$1"
  local dest="$2"
  if ln -s "$src" "$dest" 2>/dev/null && [[ -L "$dest" ]]; then
    return 0
  fi
  if [[ $WINDOWS -eq 1 ]] && command -v cygpath >/dev/null 2>&1; then
    cmd //c mklink //J "$(cygpath -w "$dest")" "$(cygpath -w "$src")" >/dev/null 2>&1 && return 0
  fi
  return 1
}

echo ""
echo "=================================================="
echo "          Agent-Skills Unix/WSL Installer         "
echo "=================================================="
echo "Source: $REPO_DIR"
echo ""

for target in "${targets[@]}"; do
  echo "Target: $target"
  mkdir -p "$target"

  if [[ "$target" == *"gemini"* ]]; then
    if [[ "$mode" == "uninstall" ]]; then
      echo "  Uninstalling Agent-Skills from $target..."
      rm -rf "$target/engineering" "$target/misc" "$target/research"
      echo "  [OK] Uninstallation complete for Antigravity."
      continue
    fi
    echo "  Synchronizing structured 9-category skill tree into $target..."
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete "$SKILLS_DIR/" "$target/"
    else
      cp -r "$SKILLS_DIR/"* "$target/"
    fi
    echo "  [OK] Successfully synchronized ${#SKILL_PATHS[@]} skills into Google Antigravity without flat duplicates."
    continue
  fi

  if [[ "$mode" == "uninstall" ]]; then
    echo "  Uninstalling Agent-Skills from $target..."
    for name in "${!SKILL_PATHS[@]}"; do
      link_path="$target/$name"
      if [[ -L "$link_path" || -d "$link_path" ]]; then
        rm -rf "$link_path"
        echo "   - Removed: $name"
      fi
    done
    echo "  [OK] Uninstallation complete."
    continue
  fi

  installed=0
  for name in "${!SKILL_PATHS[@]}"; do
    # Check if user filtered specific skills
    if [[ ${#wanted[@]} -gt 0 ]]; then
      match=0
      for w in "${wanted[@]}"; do
        [[ "$w" == "$name" ]] && match=1 && break
      done
      [[ $match -eq 0 ]] && continue
    fi

    src="${SKILL_PATHS[$name]}"
    dest="$target/$name"

    if [[ -e "$dest" || -L "$dest" ]]; then
      rm -rf "$dest"
    fi

    if make_link "$src" "$dest"; then
      ((installed++))
    fi
  done
  echo "  [OK] Successfully linked $installed skills into $target."
done

echo ""
echo "All done! Run 'git pull' in '$REPO_DIR' anytime to update all skills in place."
echo ""
