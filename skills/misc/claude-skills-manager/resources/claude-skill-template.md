---
name: guarded-workflow
description: Execute guarded project changes safely. Use only when explicitly invoked by the user via /guarded-workflow.
argument-hint: "[target-component] [--dry-run]"
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(git status *), Bash(git diff *)
---

# Guarded Workflow

Explicitly triggered Claude Code skill enforcing dry-run checks, minimal diffs, and verification evidence.

## Inputs
- Target scope: `$ARGUMENTS` (if empty, stop and ask the user for the exact target instead of guessing).

## Execution Steps
1. Locate exact callers and tests for `$0` using `Grep` and `Read` before changing any file.
2. State the minimal diff plan and check for `--dry-run` in `$ARGUMENTS`.
3. Apply the smallest coherent change solving the root cause without unrelated refactoring.
4. Run the project's concrete verification suite (`test`, `lint`, type-check) after the final edit.
5. Report exact commands run, exit codes, and changed file paths.
