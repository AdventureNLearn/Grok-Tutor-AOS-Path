# Polish counts (full-corpus check enabled)

**At:** 2026-08-07T23:31:33.8190330-04:00

## Always report both CLEAN and DUPES

| Metric | Count | Meaning |
|--------|------:|---------|
| **Batch new unique written** | **2000** | New polished files this last batch |
| **Batch dupes** | **0** | Matched entire corpus index (not just batch) |
| **Cumulative written** | **2000** | Pace session total new uniques |
| **Cumulative dupes** | **0** | Pace session total dupes skipped |
| **Unique clean index** | **21878** | Corpus-wide unique fingerprints known |
| **Polished on disk** | **22419** | Files in public/corpus/_polished |
| **CLEAN pass (audit 12/12)** | **981** / 22419 (4.4%) | Full _polished public-tier pass |
| Soft fail | 21438 | Mostly near-dups / residual chrome |
| Hard fail | 0 | OPSEC/disclaimer failures |

## Every batch now
1. Load entire corpus content index
2. Re-index entire _polished
3. Dedupe against that full map
4. Report written + dupes
5. Full audit of _polished for CLEAN count

Files: C:\AOS\logs\corpus-polish-pace\LATEST-COUNTS.md
