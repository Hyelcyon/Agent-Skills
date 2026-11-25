# Example: Explicit Slash-Only Guarded Deployment Skill

Demonstrates `disable-model-invocation: true` so Claude NEVER autonomously triggers production releases on casual conversation.

```markdown
---
name: deploy-service
description: Run build verification and deploy target environment. Explicitly invoked via /deploy-service [staging|production].
argument-hint: "[staging|production]"
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Bash(git status *), Bash(npm test *)
---

# Guarded Service Deployment

Requested environment: `$0`

## Pre-Flight Blocking Checks
1. Validate `$0` is strictly `staging` or `production`. If empty or invalid, stop immediately and ask the user.
2. Verify clean git status and zero failing tests (`npm test`). Abort on any non-zero exit code.
3. Summarize the exact commit SHA, target environment, and rollback command, then request final confirmation before executing deployment.
```
