# Corpus audit+clean COMPLETE status (partial → full pipeline running)

**Updated:** 2026-08-07T22:49:07.5551599-04:00

## High-value set (soak + spectrum + tracks) — CLEANED + AUDITED

| Metric | Value |
|--------|------:|
| Source lessons scanned | ~6.9k |
| Unique polished written | **5210** |
| Public-tier clean (12/12) | **655 (12.6%)** |
| Soft fail | 4555 |
| Hard fail | 0 |

Output: `public/corpus/_polished/`

## Perfect-overnight — CLEAN IN PROGRESS (batches)

Pipeline: `C:\AOS\logs\corpus-complete\Resume-Complete.ps1`  
Logs: `C:\AOS\logs\corpus-complete\complete-runner.log`

5M compile still writing raw perfect-overnight; cleaner dedupes into `_polished` continuously until snapshot complete, then full re-audit.

## Tools

- `scripts/corpus-polish-clean.mts` / `npm run corpus:clean`
- `scripts/corpus-polish-audit.mts` / `npm run audit:polish`
- `scripts/Run-Corpus-Clean-And-Audit-Complete.ps1`

## Ship

**HOLD** — polished unique set is `ready-internal`; public still needs human sample on soft fails + OPSEC.
