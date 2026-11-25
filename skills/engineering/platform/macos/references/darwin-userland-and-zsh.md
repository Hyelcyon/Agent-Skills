# Darwin Userland & Zsh Scripting Guide

A senior engineering guide to Darwin / BSD userland quirks, modern `zsh` scripting standards, and Homebrew package governance.

---

## 1. BSD Coreutils vs GNU Coreutils Invariants

macOS ships with BSD-derived command-line tools. Scripts written for Linux GNU coreutils will break unless BSD flags are respected:

| Utility | Linux (GNU) Behavior | macOS (BSD) Invariant |
| :--- | :--- | :--- |
| **`sed`** | `sed -i "s/a/b/g" file` | `sed -i '' "s/a/b/g" file` (Mandates empty backup extension string) |
| **`grep`** | `grep -P` (PCRE support native) | `grep -E` (Extended regex only; `-P` is not supported in stock BSD grep) |
| **`stat`** | `stat -c %s file` | `stat -f %z file` (BSD format strings) |
| **`xargs`** | `xargs -r` (no-run-if-empty) | `-r` unsupported in BSD `xargs` |
| **`date`** | `date -d "1 day ago"` | `date -v-1d` (BSD date adjustment syntax) |

---

## 2. Modern Zsh Scripting Standards (macOS Default Shell)

macOS standardizes on `zsh` as the default login shell. Key idioms:
- **Zero Word-Splitting by Default**: Unlike Bash, unquoted `$var` in zsh does not split words on spaces. However, explicit quoting `"${var}"` remains mandatory for cross-shell safety.
- **Strict Array Slicing**: zsh arrays are 1-indexed by default (`array[1]` is the first item).
- **Anonymous Functions**: Use anonymous functions with local variables for clean initialization:
  ```zsh
  () {
    local config_file="$1"
    # Scoped initialization logic
  } "configs/app.json"
  ```

---

## 3. Homebrew Architecture & Governance

Homebrew operates with distinct filesystem prefixes based on processor architecture:
- **Apple Silicon (arm64)**: `/opt/homebrew`
- **Intel (x86_64)**: `/usr/local`

### Declarative Dependency Bundling (`Brewfile`):
Never install packages with ad-hoc `brew install` commands in team environments. Modern Homebrew 4.x+ ships `brew bundle` built-in without requiring legacy `tap "homebrew/bundle"` or `homebrew/core`:
```ruby
# Brewfile
brew "git"
brew "jq"
brew "ripgrep"
cask "docker"
```

Verify and install in lockstep:
```bash
brew bundle check || brew bundle install
```
