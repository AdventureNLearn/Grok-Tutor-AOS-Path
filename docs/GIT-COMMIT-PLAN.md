# Git commit plan — Grok Tutor release structure

## Never commit
- `.env` / secrets
- `public/corpus/**` (multi-million lessons)
- `public-dev/`, `public-release/` (local junctions; README only if needed)
- `scripts/sim-output/**`
- Edge profiles, logs, `*.pre-salvage.bak`

## Suggested commit series (product → tooling → docs)

1. **feat(hive): release Hive map, library route, curriculum HUD**
   - `src/lib/tutor-hive-map.ts`, `release-curriculum.ts`, `routes/library.tsx`
   - `layout.tsx`, `first-run-coach.tsx`, hive components as needed

2. **feat(cad): Plan Lab MAC + PartMode literacy pack**
   - `src/lib/cad/**`, `routes/labs.cad.tsx`, credits PartMode

3. **feat(product): hive shell, credits, lanes, core routes**
   - remaining `src/components/hive/**`, credits, help, etc.

4. **chore(tooling): launchers, keep-server, e2e/stress suite**
   - `scripts/Start-Grok-Tutor-Release.ps1`, Keep-*, e2e-*, run-release-stress-suite
   - desktop `Open-Grok-Tutor.cmd` (if tracked from repo copy)

5. **docs: release readiness + OPSEC-safe status**
   - selected `docs/*.md` (no huge CSV/JSON dumps)

6. **chore(config): vite slim publicDir, gitignore corpus**
   - `vite.config.ts`, `.gitignore`, `package.json`

Corpus **pipeline** scripts (harvest/polish/compile) can be a separate optional commit:
`chore(ops): local corpus pipeline scripts (host-only data stays untracked)`

## Commands after structure

```powershell
cd C:\Users\Chris\Projects\Grok-Tutor-AOS-Path
npm.cmd run typecheck
npm.cmd run test:release:quick   # or test:release full
# then commits per series above
```
