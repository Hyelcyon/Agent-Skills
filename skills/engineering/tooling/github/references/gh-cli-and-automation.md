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
gh pr create \
  --title "feat(telemetry): integrate sliding window rate limiter" \
  --body-file .github/pull_request_template.md \
  --draft \
  --assignee "@me" \
  --label "security,feature"

# Execute merges only when explicitly approved by the user
gh pr merge 123 --auto --squash --delete-branch
```

The `--auto` flag schedules the pull request to merge automatically once all required checks pass and approvals are recorded (requires "Allow auto-merge" enabled in repository settings).

---

## 3. Investigating CI Failures Headless

`gh run view` prompts interactively if no `<run-id>` is supplied, causing automated shells to hang or error. Always resolve the exact `databaseId` first:

```bash
RUN_ID="$(gh run list --status failure --limit 1 --json databaseId --jq '.[0].databaseId')"
if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
  gh run view "$RUN_ID" --log-failed
fi
```

Passing an explicit run ID with `--log-failed` extracts only the failed step's console logs non-interactively.

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
