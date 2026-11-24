# Git Interactive Rebase, Bisect, and History Hygiene

Advanced engineering standards for maintaining linear Git commit history, automated regression isolation via bisect, and safe remote synchronization.

## 1. Linear History and Interactive Rebase

A clean, logical commit history simplifies pull request code reviews and enables reliable automated regression bisecting.

### Interactive Rebase Commands

To organize local commits before opening a pull request:

```bash
git rebase -i HEAD~5
```

The interactive todo list allows actions per commit:
- `pick`: Retain the commit as-is.
- `reword`: Change the commit message.
- `edit`: Pause rebase to amend files or split the commit into smaller units.
- `squash`: Meld the commit into the previous commit and concatenate messages.
- `fixup`: Meld the commit into the previous commit, discarding the commit message.
- `drop`: Remove the commit from branch history entirely.

---

## 2. Automated Autosquash Workflow

Avoid manually reordering commits in the interactive editor when writing bug fixes for earlier commits in a branch.

### Step 1: Create a Fixup Commit

```bash
git commit --fixup 3b9c41d
```

Git generates a commit message formatted as `fixup! <original commit title>`.

### Step 2: Autosquash Rebase

```bash
git rebase -i --autosquash main
```

Git automatically positions the fixup commit directly beneath commit `3b9c41d` and marks it as `fixup`, squashing it cleanly without manual editor intervention.

---

## 3. Automated Defect Hunting with Git Bisect

When a bug is detected in production and its introducing commit is unknown, `git bisect` performs binary search across history to locate the culprit commit in $O(\log N)$ steps.

### Automated Bisect with Test Runner

```bash
git bisect start
git bisect bad HEAD
git bisect good v2.1.0
git bisect run npm test
```

Git automatically checks out midpoint commits and executes `npm test`:
- If the script exits with code 0, Git marks the commit good.
- If the script exits with code 1-127 (except 125), Git marks the commit bad.
- If the script exits with 125, Git skips the commit as untestable.

Once the search completes, Git outputs the exact commit SHA that introduced the failure. Always reset bisect state when finished:

```bash
git bisect reset
```

---

## 4. Safe Remote Pushing with --force-with-lease

After rebasing a feature branch, remote history must be updated. Never run naked `git push --force`, which overwrites upstream changes pushed by teammates.

Always use:

```bash
git push --force-with-lease
```

`--force-with-lease` verifies that the remote ref matches your local remote-tracking branch. If another engineer pushed commits in the interim, the push is safely rejected.
