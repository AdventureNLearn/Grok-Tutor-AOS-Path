# Salvage incomplete content — 10–12 window

**At:** 2026-08-08T08:49:21.6909567-04:00
**Target:** pattern-lab / Grok-Tutor-AOS-Path
**Ship:** HOLD (educational; human OPSEC still required)

## What was incomplete

| Soft-fail bucket | Count | Salvage? |
|------------------|------:|----------|
| A10 only (dup body) | ~26.5k | No — not unique content |
| A12 only (skill chrome / false chrome) | 239 | **Yes** |
| A10+A12 (READY-PUBLIC dups) | 233 | Structure fix for pack quality |
| Hard fails | 0 | n/a |

## Root cause found

Polish writers used `.filter(Boolean)` on frontmatter lines including a trailing empty string, then concatenated body. That emitted `---# Title` (no newline after closing fence). Auditor treated whole file as body → **false A12** on `skillId:` in frontmatter.

## Fixes applied

1. **`scripts/salvage-incomplete.mts`** — structure repair (`---#`), bare skill-id strip, blank mode fill
2. **309** paths salvaged (A12 + blank-mode CLEAN) then **274** READY-PUBLIC
3. **`polish-training-queue.mts`** + **`polish-all-uniques.mts`** — prevent reintroducing `---#`

## CLEAN delta

| Metric | Before | After | Delta |
|--------|-------:|------:|------:|
| Combined unique CLEAN (12/12) | **1022** | **1100** | **+78** |
| _polished CLEAN | 981 | 987 | +6 |
| _training_material unique CLEAN | 41 | 113 | +72 |
| **READY-PUBLIC pack CLEAN** | **41** | **273** | **+232** |
| READY-PUBLIC soft | 233 A12 | 1 A10 | cleared A12 |
| Hard fails | 0 | 0 | 0 |
| Remaining soft (all A10 dups) | — | 26891 | skip |

## READY-PUBLIC

- **273 / 274** public-tier CLEAN (99.6%)
- 1 residual near-dup (A10) inside the pack

## Not salvaged (by design)

- **~26.9k A10** polished near-duplicates — content already represented in the unique CLEAN set
- Raw 5M perfect-overnight still under harvest (~2.5M+ scanned); polish after unique harvest

## Artifacts

- `docs/SALVAGE-1012-REPORT.md`
- `C:\AOS\logs\corpus-salvage-1012\`
- Post-salvage audit: `scripts/sim-output/corpus-polish-audit/2026-08-08T12-48-09-219Z/`
- READY-PUBLIC audit: `.../2026-08-08T12-48-07-728Z/`

## Window note

Operator window shifted **9–11 → 10–12**. Salvage complete within morning prep; remaining time fits re-list CLEAN by industry + harvest continue.
