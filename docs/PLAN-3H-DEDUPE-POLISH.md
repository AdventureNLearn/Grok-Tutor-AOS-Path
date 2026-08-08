# 3-hour plan: dedupe + polish (not “process 5M raw”)

**Window:** next **3 hours** from plan acceptance  
**Target tree:** `C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
**Ship:** still **HOLD** — this produces a **usable unique polished library**, not a public deploy  
**Date context:** 2026-08-08 morning

---

## 0. Reality check (why we will not polish “all 5M files”)

| Pool | Approx size | Role |
|------|------------:|------|
| Perfect raw (`perfect-overnight/`) | **~4.8M–5M** | Coverage volume; extreme near-dup rate |
| Soak raw (`balanced-soak/`) | **~265k+** | Coverage volume |
| Already polished (`_polished/`) | **~27k** | Candidate library |
| **CLEAN pass (12/12 public)** | **~981** | Actually gate-clean |
| Soft fail (almost all A10 near-dup) | **~26k** | Same shells under normalize |
| Pace yield lately | ~**120 new / 1,880 dup** per 2k batch | ~6% unique write |

**Math:** At current unique yield, “polish every raw file” is multi-day, not 3 hours.  
**Honest 3h goal:** maximize **unique, usable, cleaned lessons** + a **complete unique index** of the whole corpus, not rewrite 5M markdown files.

### Success criteria (end of 3h)

| # | Outcome | Target |
|---|---------|--------|
| S1 | Generators frozen (no more thrash) | Soak stopped or paused; 5M already complete |
| S2 | Full-corpus content index built (hash → best path) | Covers perfect + soak + spectrum + tracks + polished |
| S3 | **Unique corpus** folder materialised | One best file per content hash |
| S4 | Unique set **bulk-polished** (chrome strip, hygiene, encoding) | All uniques from S3 |
| S5 | Final counts reported | unique total, dupes total, CLEAN pass, soft/hard |
| S6 | Promote list | `ready-internal` full uniques; `ready-public` = CLEAN 12/12 (+ optional human sample) |

**Non-goals (3h):** rewrite all 5M raw files in place; public ship; human rubric on every lesson.

---

## 1. Operating principles

1. **Dedupe first, polish second** — never polish known dups.  
2. **Entire-corpus hash map every decision** — one durable index, loaded every batch.  
3. **Always report both:** `clean` **and** `dupes` (batch + cumulative).  
4. **Prefer quality seeds:** reasoning-tracks → full-spectrum → high-score unique perfect → soak uniques.  
5. **Stop full-library audit every 2k batch** during bulk phase (it costs ~30–40s and does not raise CLEAN when A10 is saturated). Audit **unique set only** at checkpoints + final.  
6. **Disk:** free ~209 GB; unique extract + polish should stay well under that if we do not duplicate the full 5M tree.

---

## 2. Throughput model (planning numbers)

| Mode | Est. rate | 3h capacity |
|------|-----------|-------------|
| Full index scan (hash only, stream) | ~3–8k files/min (I/O bound) | **~0.5–1.5M** files hashed (may need parallel or accept partial + resume) |
| Polish unique only (write) | ~500–2k polished/min when not walking 5M each time | **~50k–200k** unique writes if uniques exist |
| Observed unique yield from raw perfect | ~5–10% early, later ~6% (120/2000) | **Unique universe may be only tens of thousands**, not millions |

**Implication:** After index, if unique count is e.g. **30k–80k**, we **can** polish all uniques in 3h. If unique count is **>200k**, polish top-N by score/source priority and leave rest indexed as “unique raw, polish later.”

---

## 3. Phase plan (180 minutes)

### Phase A — Freeze & free capacity (0:00–0:15)

| Action | Why |
|--------|-----|
| Stop continuous soak (or soft-stop at next cycle) | Free disk/CPU; corpus stable for index |
| Stop `AOS-Tutor-Polish-Pace` 3.5m task | Replace with bulk 3h worker |
| Leave Vite up if needed | Operator can still view product |
| Snapshot counts → `C:\AOS\logs\corpus-3h\BASELINE.json` | 5M, soak, polished, CLEAN, freeGB |
| Confirm 5M process dead/complete | Already 5M/5M |

**Exit:** Stable corpus, baseline numbers recorded.

---

### Phase B — Full-corpus dedupe index (0:15–1:15)

**Script work (implement if missing):** `scripts/build-corpus-unique-index.mts`

- Walk: `balanced-soak`, `perfect-overnight`, `full-spectrum`, `reasoning-tracks`, `_polished`
- For each `.md`: content hash = SHA256(normalize(body)) ignoring timestamps/cycle ids  
- Keep **best** path per hash: prefer `_polished` > `reasoning-tracks` > `full-spectrum` > `perfect-overnight` > `balanced-soak`; tie-break higher `scoreMin`, longer body  
- Stream to:
  - `C:\AOS\logs\corpus-3h\unique-index.jsonl` (`hash, rel, source, score, bytes`)
  - `C:\AOS\logs\corpus-3h\COUNTS.json` (`scanned, unique, dupes = scanned - unique`)

**Every progress line reports:**

```text
scanned=… unique=… dupes=… rate=…/s eta=…
```

**Exit:** `COUNTS.json` with definitive **unique** and **dupe** totals for entire corpus.

**If index cannot finish in 60m:** finish perfect + soak first; spectrum/tracks already tiny; resume index in background while Phase C starts on partial unique set from polished + completed roots.

---

### Phase C — Materialise unique corpus (1:15–1:35)

**Script:** `scripts/export-unique-corpus.mts` (or clean mode `--uniques-only`)

- For each unique hash, copy **best** file →  
  `public/corpus/_unique/<source>/<…>.md`  
  (or hardlink if same volume to save time/disk)
- **Do not** copy dups.
- Report: `uniqueExported`, `dupesNotExported`, bytes.

**Exit:** `_unique` tree size == unique count (or hardlink count).

---

### Phase D — Bulk polish uniques only (1:35–2:40)

**Continuous worker** (not 3.5m schedule):

```text
tsx scripts/corpus-polish-clean.mts --roots _unique --batch-size 5000 --offset N --full-corpus-index
```

Loop until `_unique` exhausted → write to `public/corpus/_polished` (or `_polished_v2` for clean slate).

**Every batch log (mandatory):**

| Field | Meaning |
|-------|---------|
| `batchWritten` | New unique polished this batch |
| `batchDupes` | Hit full index (should be ~0 if input is already unique) |
| `cumulativeWritten` | Running total |
| `cumulativeDupes` | Running total |
| `uniqueIndexSize` | Full-corpus unique map size |
| `polishedOnDisk` | File count |

**Checkpoint every 15 min:** quick audit of **new polished only** or sample 2k — not full 27k if time-critical.  
**Skip** full 27k audit every batch (that was burning ~40s for no CLEAN gain).

**A12 fix:** chrome strip already in cleaner — re-run ensures residual 6-class fails drop.  
**A10 on public audit:** for **promote**, treat “one survivor per hash” as unique; CLEAN 12/12 stays the **public** bar; unique polished that fail only A10 against siblings are **ready-internal**.

**Exit:** All uniques polished once; counts file updated.

---

### Phase E — Final audit + packaging (2:40–3:00)

1. Full audit of final polished unique set (one pass).  
2. Write:

| Output | Content |
|--------|---------|
| `C:\AOS\logs\corpus-3h\FINAL-COUNTS.md` | scanned, unique, dupes, polished, CLEAN, soft, hard |
| `public/corpus/_polished/READY-PUBLIC/` | only CLEAN 12/12 (copy or list) |
| `public/corpus/_polished/READY-INTERNAL/` | all unique polished |
| Brain dual-write | `14-CORPUS-AUDIT-AND-POLISH` + WORKING-DOCUMENT |

3. Operator read-out: **how many clean, how many dupes, how many unique polished**.

---

## 4. What we stop doing (explicit)

| Stop | Reason |
|------|--------|
| Polishing raw perfect 2k-at-a-time from offset 106k of 4.8M | 6% unique; years at that pace for “all” |
| Full `_polished` audit every batch | Dominates wall time; CLEAN stuck ~981 |
| Growing soak during 3h window | Moves the target |
| In-place rewrite of all 5M raw | Disk + time death |

---

## 5. Resource plan

| Resource | Plan |
|----------|------|
| CPU | 1 bulk clean worker; optional 2nd only for index if disk allows |
| Disk | Prefer hardlinks into `_unique`; avoid second 5M copy |
| RAM | Stream index; do not hold 5M file bodies |
| Schedule | Single `AOS-Tutor-3h-Polish` job or detached PS1 with 3h deadline |

---

## 6. Reporting contract (every checkpoint)

Always print **both**:

```text
CLEAN_PASS=<n>          # public 12/12
UNIQUE_POLISHED=<n>     # distinct content kept
DUPES_SKIPPED=<n>       # scanned - unique (or batch dups)
SCANNED=<n>
```

Never report only “files written.”

---

## 7. Risk register

| Risk | Mitigation |
|------|------------|
| Unique count still huge (>200k) | Priority polish: tracks + spectrum + top scoreMin uniques; rest indexed only |
| Index build >60m | Parallel by industry folder; resume file; start polish on polished+tracks first |
| CLEAN stays ~1k | Accept: public set is small; internal unique set is the 3h win |
| Disk <50 GB free | Hardlink-only export; no raw copy |
| A10 false “dup” of useful variants | Keep best by score; optional looser hash for internal tier later |

---

## 8. Decision needed from you

**Recommend: Option 1 (default)**

| Option | Goal in 3h | Tradeoff |
|--------|------------|----------|
| **1. Unique-first (recommended)** | Index all → polish **all uniques** → report clean/dupes | Does not rewrite 5M raw; may yield ~1k public CLEAN + tens of k internal unique |
| **2. Public-CLEAN maximizer** | Focus only on raising CLEAN 12/12 (repair A10 policy / diversify content) | Smaller library, higher public quality |
| **3. Brute raw polish** | Keep chewing perfect from offset 106k | Will **not** finish 5M in 3h; not recommended |

---

## 9. Immediate next steps after you approve

1. Freeze soak + unregister polish-pace task  
2. Implement/verify `build-corpus-unique-index.mts` + `export-unique-corpus.mts`  
3. Run Phase B→E under `C:\AOS\logs\corpus-3h\`  
4. Hand you **FINAL-COUNTS.md** with clean + dupes + unique totals  

---

*Plan only — no claim that 5M individual raw files will each be polished in 3 hours.*
