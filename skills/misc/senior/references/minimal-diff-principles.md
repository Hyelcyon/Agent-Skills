# Minimal Diff Engineering Principles

## 1. The Smallest Coherent Change
The goal of senior engineering is not to maximize code output, but to minimize unintended surface area while completely solving the task:
- Every line of code added carries lifetime maintenance and cognitive cost.
- Before modifying a file, identify the exact boundary of what must change.
- Never refactor surrounding code during a targeted bug fix.

## 2. Structural Conservation
- Match existing project conventions, variable naming, and indentation.
- Preserve public function signatures, parameter orders, and return types.
- Delete unused code cleanly; never leave commented-out blocks.

## 3. Scope Discipline
- Restrict changes to what was explicitly requested or structurally required.
- Do not introduce configuration flags or speculative hooks without explicit user instruction.
