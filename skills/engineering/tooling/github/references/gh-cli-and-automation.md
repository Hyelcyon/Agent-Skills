# GitHub CLI (gh) Automation and Scripting Architecture

Engineering guidelines for headless scripting, automated CI/CD pipeline triggers, release generation, and API queries using the official GitHub CLI (`gh`).

## 1. Headless Authentication and Execution

In automated developer environments and AI agent workflows, authenticate `gh` non-interactively using personal access tokens or GitHub Actions tokens:

```bash
# Bash / Linux / macOS:
export GH_TOKEN="${GITHUB_TOKEN}"
gh auth status

# PowerShell / Windows:
$env:GH_TOKEN = $env:GITHUB_TOKEN
gh auth status
```

Setting `GH_TOKEN` allows all `gh` commands to execute without prompting for browser login or interactive SSH keys.

---

## 2. Automated Pull Request Lifecycle

Manage the complete lifecycle of a pull request from the command line without opening a browser:

```bash
gh pr create --title "feat(auth): integrate passkey webauthn provider" --body-file .github/templates/pr-description.md --assignee @me --label "security,feature"
gh pr merge --auto --squash --delete-branch
```

The `--auto` flag schedules the pull request to merge automatically as soon as all required status checks pass and approvals are recorded.

---

## 3. Investigating CI Failures Headless

When a workflow fails, retrieve exact failure logs directly into the terminal:

```bash
gh run list --limit 5
gh run view --log-failed
```

`gh run view --log-failed` extracts only the failed step's console logs, omitting thousands of irrelevant lines from passing steps.

---

## 4. Querying GitHub API with JSON and JQ Formatting

Use `gh api` to inspect repository metadata without writing custom HTTP client wrappers:

```bash
gh api repos/{owner}/{repo}/pulls \
  --paginate \
  --jq '.[] | {number: .number, title: .title, author: .user.login}'
```

The built-in `--jq` flag performs JSON filtering directly inside `gh`, eliminating external dependencies on third-party binary installations.

---

## 5. Non-Interactive Repository Creation & Bootstrapping

Initialize and push local repositories to GitHub completely headless:

```bash
gh repo create <owner>/<repo-name> \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "Deterministic description of the project"
```

The `--source=.` flag binds the current directory, `--remote=origin` adds the remote URL, and `--push` automatically performs the initial branch publish without interactive prompts.
