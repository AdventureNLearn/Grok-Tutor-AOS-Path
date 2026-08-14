# Full pipeline run schedule + forecasts (to 11:00 + full-set ETA)

**Status:** Planning / forecast only — cleaner not auto-started from this doc  
**Baseline clock:** ~**07:02 ET, 2026-08-08** (just after live stop window)  
**Planning horizon:** **07:00 → 11:00** (4 hours)  
**Queue map:** `docs/POST-7AM-TIERED-POLISH-QUEUE.md`  
**Related:** `docs/PLAN-3H-DEDUPE-POLISH.md`

---

## 1. Baseline inventory (start of morning)

| Pool | Count | Notes |
|------|------:|-------|
| Perfect raw (5M compile) | **5,000,000** lessons claimed | Complete |
| Perfect on-disk (listed in clean) | **~4.82M** paths | Concurrent write variance possible |
| Soak lessons | **~274k** | Should be stopped at 7am |
| Polished on disk | **~27.4k** | Growing from overnight pace |
| CLEAN pass (12/12 public) | **981** | Stable; soft fail dominated by A10 |
| Pace cumulative written (unique-ish) | **~8.8k** | |
| Pace cumulative dupes skipped | **~75k** | |
| Free disk | **~209 GB** | |

### Measured throughput (overnight pace — empirical)

| Operation | Observed | Rate |
|-----------|----------|------|
| Clean batch 2,000 raw perfect | ~6–11 min wall | ~**3–5.5 files/s** scan+polish attempt |
| Unique write per batch | **120** / 2000 | **6%** unique yield |
| Dupes per batch | **1,880** / 2000 | **94%** |
| Full `_polished` audit (~27k) | ~30–45 s | After each batch (optional cost) |

**Key insight:** Chewing raw perfect linearly yields ~**720 unique/hour** at continuous 2k batches with no idle (120 unique × ~6 batches/hour).  
**Full 5M raw polish at 6% unique** implies ~**300k uniques** theoretical upper bound if diversity were uniform (it is **not** — yield falls as index fills; many batches will approach 0 new uniques).

---

## 2. Two different “complete” definitions

| Definition | Meaning | Realistic by 11:00? |
|------------|---------|---------------------|
| **A. Queue-complete (recommended)** | Pins + Pass 1 + Pass 2 for all 32 industries (tiered) | **Yes** |
| **B. Full raw file set** | Every raw lesson polished | **No** (multi-day) |
| **C. Full unique set** | Every distinct content hash polished once | **Maybe partial** — depends on unique count after index |

This schedule optimizes for **A**, with optional progress on **C**, and a separate ETA for **B**.

---

## 3. Full pipeline run (ordered)

### Stage 0 — Freeze (07:00–07:15) · ~15 min

| # | Action | Owner | Output |
|---|--------|-------|--------|
| 0.1 | Confirm `AOS-Tutor-Prep-Stop-7am` ran | Auto/human | soak/pace dead |
| 0.2 | Kill any residual soak / polish-pace / thrash clean | Script | Stable corpus |
| 0.3 | Leave Vite up if useful | — | :8085 optional |
| 0.4 | Write `C:\AOS\logs\corpus-post7\BASELINE.json` | Script | 5M, soak, polished, CLEAN, freeGB |
| 0.5 | Operator edit window on queue doc | Human | Approved tier/pass targets |

**Do not polish yet.**

---

### Stage 1 — Sort / index (07:15–08:15) · ~60 min budget

| # | Action | Output |
|---|--------|--------|
| 1.1 | Build **full-corpus content hash index** (stream) over perfect + soak + spectrum + tracks + polished | `unique-index.jsonl`, `COUNTS.json` |
| 1.2 | Report `SCANNED / UNIQUE / DUPES` for entire corpus | `INDEX-COUNTS.md` |
| 1.3 | Build **tiered queue manifest** (pins + 32× modes) selecting **best unique per slot** | `QUEUE-MANIFEST.jsonl` + `.md` |
| 1.4 | Mark gaps | `GAPS.md` |

**Forecast for Stage 1**

| Work | Est. time | Basis |
|------|-----------|--------|
| Hash ~5.0–5.3M lesson files @ 50–150 files/s | **9–30 hours** full scan if single-threaded naive | Worst case |
| Hash with optimized walk + skip already-indexed + multi-folder | **4–12 hours** full | Still may overrun 60m |
| **Practical 60m target** | Index **as much as possible** + **complete queue selection from**: polished + spectrum + tracks + **sampled/strided perfect** | Guarantees queue by 08:15 |

**Stage 1 contingency (recommended default for 11:00 success):**

1. **Fast path (guaranteed by 08:15):**  
   - Index: `_polished` + `full-spectrum` + `reasoning-tracks` + `balanced-soak` fully  
   - Perfect: **per-industry stratified sample** (e.g. top N by score per industry×mode from directory listing, not full 5M hash first)  
2. **Background path:** continue full perfect hash index until done (even past 11:00)  
3. Queue for 11:00 uses fast path; full-set ETA uses full index when ready  

---

### Stage 2 — Materialize queue set (08:15–08:30) · ~15 min

| # | Action | Output |
|---|--------|--------|
| 2.1 | Export/hardlink **queued best files only** → `public/corpus/_unique_queue/` | One file per slot (+ pins) |
| 2.2 | Count queue | `QUEUE-COUNTS.md` |

**Size forecast**

| Set | Files |
|-----|------:|
| Pins (tracks + spectrum) | ≤ **38** |
| Pass 1 (32 × 3) | **96** |
| Pass 2 (32 × 6) | **192** (includes Pass 1) |
| Pass 3 Tier A depth (+6 × 15) | **+90** → **282** if enabled |
| **Recommended by 11:00** | **192 + pins ≈ 200–230** distinct paths (after dedupe maybe **180–220**) |

---

### Stage 3 — Polish queue only (08:30–10:15) · ~105 min

Continuous cleaner (no 3.5m idle), **only** `_unique_queue` paths:

| Pass | Work | Est. polish time |
|------|------|------------------|
| 0 Pins | ≤38 files | **2–5 min** |
| 1 Coverage | 96 slots | **5–15 min** |
| 2 Full modes | 192 slots | **10–25 min** |
| 3 Tier A depth | +90 | **5–15 min** |
| **Total polish wall** | **~180–282 files** | **~20–60 min** with headroom |

**Why so fast vs overnight:** overnight chewed **raw dups**; queue is **pre-sorted uniques**.

**Every batch still logs:** `written` · `dupes` · `CLEAN` (audit queue set, not all 27k).

---

### Stage 4 — Final audit + package (10:15–11:00) · ~45 min

| # | Action | Output |
|---|--------|--------|
| 4.1 | Full audit of **queue polished set** (not entire historical polished dump) | CLEAN / soft / hard |
| 4.2 | Optional: re-audit full `_polished` once | Trend vs 981 baseline |
| 4.3 | Split READY-PUBLIC (12/12) vs READY-INTERNAL | Folders or manifests |
| 4.4 | `FINAL-COUNTS.md` + brain dual-write | Operator readout |
| 4.5 | Stop | Hand off for morning E2E later |

---

## 4. What you should have **complete by 11:00** (if we follow the queue)

### Primary success (queue-through)

| Deliverable | Target by 11:00 | Confidence |
|-------------|----------------:|:----------:|
| Live runs frozen | yes | High |
| Queue manifest (32 industries × 6 modes) | **192 slots** classified queued/gap/clean | High |
| Pins polished | **6 tracks + 32 spectrum** (≤38) | High |
| **Pass 1 complete** | **96** industry×mode (explain/practice/scenario) | **High** |
| **Pass 2 complete** | **192** industry×mode (all modes) | **High** |
| Pass 3 Tier A depth | **+90** optional | Medium (if time) |
| Unique queue polished | **~180–280** files | High |
| CLEAN pass on **queue set** | **≥150–192** (hope); floor **≥96** | Medium–High* |
| Gaps documented | all empty slots listed | High |
| Full 5M raw polished | **no** | N/A |

\*CLEAN on queue set should be **much higher %** than 3.6% of dump, because queue picks best-per-slot not near-dup spam. Overnight CLEAN **981** may remain the bulk-dump number; **queue CLEAN** is the 11:00 KPI.

### Secondary (nice if Stage 1 background finishes)

| Deliverable | By 11:00 |
|-------------|----------|
| Full-corpus UNIQUE / DUPES totals | Partial or complete |
| Background index % | Report progress |

### Explicit non-targets by 11:00

- Polishing all **5M** perfect files  
- Raising dump CLEAN from 981 → tens of thousands (A10 saturation)  
- Morning E2E / public ship  

---

## 5. Hour-by-hour forecast (07:00 → 11:00)

| Time | Phase | Complete if on track |
|------|--------|----------------------|
| **07:00** | Freeze | Writers stopped; baseline counts |
| **07:15** | Edit/approve queue | Operator signed map |
| **07:15–08:15** | Sort/index (fast path) | Manifest 192 slots + pins; gaps known |
| **08:15–08:30** | Export queue | `_unique_queue` ready |
| **08:30–09:00** | Polish Pass 0–1 | Pins + **96** coverage slots done |
| **09:00–09:45** | Polish Pass 2 | **192** mode slots done |
| **09:45–10:15** | Polish Pass 3 or slack | Tier A depth **or** early final audit |
| **10:15–11:00** | Final audit + package | READY-* + FINAL-COUNTS |

**Buffer:** ~30–45 min inside the plan for index slowness / operator edits.

---

## 6. Forecast: full file set (all raw lessons)

### 6.1 Definition

**Full file set** = attempt to polish **every raw lesson file** once (perfect ~5M + soak ~0.27M ≈ **~5.3M**), with corpus-wide dedupe so writes only happen for new uniques.

### 6.2 Using measured unique yield (6%)

| Metric | Value |
|--------|------:|
| Raw files | ~5,300,000 |
| Expected unique @ 6% constant yield | ~**318,000** |
| Expected dupes skipped | ~**4,980,000** |
| Time to **scan** all @ 4 files/s | 5.3e6 / 4 = **1.325e6 s ≈ 15.3 days** continuous |
| Time to **scan** @ 10 files/s | ≈ **6.1 days** |
| Time to **write** 318k uniques @ 2 files/s polish | ≈ **1.8 days** |
| **Combined realistic (single worker)** | **~1–3 weeks** calendar if 24/7; **longer** if yield falls |

### 6.3 If unique yield collapses (likely)

As the global index fills, batches go from 120 new → **tens → zero** new uniques while still paying scan cost.

| Scenario | Unique universe | Scan-all ETA | Polish-all-uniques ETA |
|----------|----------------:|-------------:|------------------------|
| Optimistic (15% unique) | ~800k | 1–2 weeks scan | +days–weeks write |
| Measured-like (6%) | ~300k | ~1–2 weeks scan | +2–5 days write |
| Saturated (1–2% unique) | ~50–100k | still ~week+ scan | +1–2 days write |
| **Queue-only (192–282)** | **~200–300** | **hours** | **&lt;1 hour polish** |

### 6.4 Full index-only (no polish)

Hash every file, no markdown rewrite:

| Rate | ETA for 5.3M |
|------|--------------|
| 20 files/s | ~**3.1 days** |
| 50 files/s | ~**1.2 days** |
| 100 files/s | ~**15 hours** |

(Requires optimized I/O; not proven at those rates on this host yet.)

### 6.5 Bottom line full-set forecast

| Goal | Forecast |
|------|----------|
| **Tiered queue through 11:00** | **Achievable** |
| **All uniques polished** | **Days**, after unique count known |
| **All raw files visited + polished** | **~1–3+ weeks** single-threaded; not an 11:00 job |

---

## 7. KPI dashboard (what to watch during the run)

| KPI | 11:00 target | Full-set north star |
|-----|--------------|---------------------|
| `QUEUE_SLOTS_FILLED` | **192/192** (or gaps documented) | n/a |
| `UNIQUE_POLISHED_QUEUE` | **≥180** | = unique universe |
| `CLEAN_PASS_QUEUE` | **≥96** (stretch ≥150) | maximize |
| `DUPES_SKIPPED_TOTAL` | report truthfully | ~millions |
| `RAW_SCAN_PCT` | optional background % | 100% |
| `HARD_FAIL` | **0** | **0** |

---

## 8. Pipeline artifact layout

```text
C:\AOS\logs\corpus-post7\
  BASELINE.json
  INDEX-COUNTS.md          # SCANNED / UNIQUE / DUPES
  unique-index.jsonl
  QUEUE-MANIFEST.jsonl
  QUEUE-MANIFEST.md
  GAPS.md
  FINAL-COUNTS.md

public/corpus/
  _unique_queue/           # selected best only (sort output)
  _polished/               # polished outputs
  _polished/READY-PUBLIC/  # CLEAN 12/12
  _polished/READY-INTERNAL/
```

---

## 9. Decision summary

| Question | Answer |
|----------|--------|
| By 11:00 if we follow tiered queue through? | **Pins + 192 industry×mode slots sorted and polished**; gaps listed; CLEAN on queue set; full-set **not** done |
| How long for full raw file set? | **~1–3+ weeks** continuous single worker at measured rates; index-only **~0.5–3 days** if optimized |
| What to run first after freeze? | **Sort/index + queue manifest**, then polish **queue only** |

---

## 10. Approval

```text
[ ] Accept 11:00 target = queue Pass 0–2 (192 + pins), not 5M raw
[ ] Accept full-set as multi-day background after 11:00
[ ] Stage 1 fast-path index (queue-complete) vs wait for full 5M hash before any polish
Operator:
Date:
```

---

*Forecasts use measured overnight rates (120 unique / 1880 dup per 2000 @ ~6–11 min/batch). Re-estimate after Stage 1 unique count is known.*
