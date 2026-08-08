# Corpus quality — worst packs (T6)

**Source:** `npm run audit:corpus` → `scripts/corpus-quality-report.json`  
**Generated reference:** 2026-08-05 report (re-run audit to refresh).  
**Ship:** not required to fix before next local build; track for depth work.

## Headline (last audit)

| Metric | Value |
|--------|------:|
| Industries / packs | 32 |
| Lessons | 192 |
| Turns | 768 |
| Modes | 6 |
| Skills enabled | 43 |
| Packs cover all industries | yes |
| Weak quiz items | 48 |

## Thin packs (fewest words) — fix first

| Rank | Industry id | Words (pack body) |
|-----:|-------------|------------------:|
| 1 | agriculture | 262 |
| 2 | project-management | 263 |
| 3 | quality | 265 |
| 4 | sales | 265 |
| 5 | design | 269 |
| 6 | cdl | 272 |
| 7 | accounting | 279 |

## Remediation order (local, no ship)

1. Expand **agriculture**, **project-management**, **quality**, **sales**, **design** practice + scenario turns (+safety lines where relevant).  
2. Rebalance weakest quiz items (`scripts/rebalance-quizzes.mts` if still applicable).  
3. Re-run `npm run audit:corpus` and replace this table.  
4. Prefer depth over adding industry #33.

## Pass criteria (discussion lock)

- No pack under **320** body words  
- Weak quiz items trending down each pass  
- Zero missing industry coverage (already green)
