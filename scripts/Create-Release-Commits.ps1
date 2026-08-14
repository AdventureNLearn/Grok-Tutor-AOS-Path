# Run after: git config user.name / user.email (or use -c flags)
# From repo root C:\Users\Chris\Projects\Grok-Tutor-AOS-Path
# This script re-stages and creates logical commits.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Commit-IfStaged($msg) {
  $s = git diff --cached --name-only
  if (-not $s) { Write-Host "skip (empty): $($msg.Split("`n")[0])"; return }
  git commit -m $msg
}

# reset soft staging and recommit in series
git reset HEAD

# 1 config
git add .gitignore vite.config.ts package.json package-lock.json tsconfig.json .env.example NOTICE README.md
Commit-IfStaged @"
chore(config): slim Vite publicDir and ignore mega-corpus

Keep multi-million lesson trees out of git and Vite builds.
"@

# 2 product source
git add src/ public/soak/
Commit-IfStaged @"
feat(tutor): Hive release surface, library, Plan Lab, CAD packs

Integrate workspace combs (library, credits, Plan Lab MAC+PartMode),
release curriculum HUD, training library route, and offline CAD literacy.
"@

# 3 tooling
git add scripts/ Open-Grok-Tutor.cmd Open-Grok-Tutor.ps1 START-DEV-KEEP-OPEN.cmd
Commit-IfStaged @"
chore(tooling): release launcher, keep-server, e2e and stress suite

Secondary-display launcher, durable Vite keep-alive, and full release
stress suite for pre-ship UI verification.
"@

# 4 docs
git add docs/
Commit-IfStaged @"
docs: release readiness, PartMode map, stress summaries

OPSEC-safe status docs for thin ship; corpus bulk data remains untracked.
"@

git status -sb
git log -5 --oneline
