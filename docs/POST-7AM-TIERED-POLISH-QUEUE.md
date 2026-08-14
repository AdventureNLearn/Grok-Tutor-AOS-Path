# Post-7am tiered polish queue (MAP ONLY — do not start cleaner yet)

**Status:** DRAFT for operator edit  
**Trigger:** After live overnight runs stop at **07:00** (`AOS-Tutor-Prep-Stop-7am`)  
**Do not start cleaner until operator approves this map**  
**Goal:** Sort first, then polish a **usable balanced set** — not all 5M raw files  
**Always report:** `CLEAN_PASS` + `DUPES` + `UNIQUE` against **entire corpus index**

---

## 1. When this starts

| Step | Condition |
|------|-----------|
| T0 | Clock ≥ **07:00** local **or** stop task has run |
| T0+ | Confirm live writers stopped: soak / perfect-5M / thrash cleaners dead |
| T0+ | **Do not** auto-start bulk cleaner until this doc is edited + approved |
| T1 | Operator says **go** on this queue (with any edits) |

### Live systems expected at handoff

| System | Expected at 7am |
|--------|-----------------|
| 5M perfect compile | Complete (5M/5M) — raw under `public/corpus/perfect-overnight/` |
| Continuous soak | Stopped by prep stop (or kill if still alive) |
| Polish-pace 3.5m task | Unregister at 7am with stop task (or manually) |
| Vite :8085 | May remain up for operator check |
| Existing `_polished/` | Keep as seed; re-sort into queue (do not delete until export) |

---

## 2. Sort philosophy (where we are)

1. **Industry / trade / craft first** — matches product packs and tutor routing.  
2. **Mode second** — learner journey: foundation → drill → pressure → check → career.  
3. **Source third** — prefer higher-structure seeds over raw volume.  
4. **Quality fourth** — `scoreMin`, body length, already-polished preferred.  
5. **Dedupe always** — one best file per content hash across **entire corpus** before polish write.

We are building a **demo-ready educational library with full industry coverage**, not finishing a 5M rewrite.

---

## 3. Source preference (within each industry × mode)

When multiple files map to the same industry/mode (or same content hash), keep **best** in this order:

| Rank | Source | Path pattern | Why |
|-----:|--------|--------------|-----|
| 1 | Reasoning tracks | `reasoning-tracks/` | Curated multi-turn |
| 2 | Full-spectrum | `full-spectrum/` | Full mode ladder per industry |
| 3 | Already polished | `_polished/**` | Chrome/hygiene already applied |
| 4 | Perfect compile | `perfect-overnight/<industryId>/` | Stronger structure than soak |
| 5 | Balanced soak | `balanced-soak/<industryId>/` | Fill gaps only |

**Tie-break:** higher `scoreMin` → longer body → newer `generatedAt`.

---

## 4. Mode order (within each industry)

| Order | Mode | Role in library |
|------:|------|-----------------|
| 1 | `explain` | Plain foundation |
| 2 | `practice` | Actionable drill |
| 3 | `scenario` | On-job pressure / safety judgment |
| 4 | `socratic` | Challenge thinking |
| 5 | `quiz` | Retention check |
| 6 | `career` | 90-day / growth framing |

**Pass 1 (coverage):** take **best unique** for modes 1–3 first (explain + practice + scenario).  
**Pass 2 (full mode set):** fill modes 4–6.  
**Pass 3 (depth):** extra uniques for Tier A only.

---

## 5. Industry tiers (full catalog — 32 industries)

All IDs from `src/lib/industries.ts`. Edit freely.

### Tier A — Safety + demo spine (do first)

Safety-first and/or strongest public demo crafts.

| # | industryId | Display name | Sector | safetyFirst | Pass-1 target | Pass-2 target | Notes / edit |
|--:|------------|--------------|--------|:-------------:|--------------:|--------------:|--------------|
| A01 | `electrical` | Electrical | trades | yes | 3 | 6 | |
| A02 | `plumbing` | Plumbing | trades | yes | 3 | 6 | |
| A03 | `hvac` | HVAC / R | trades | yes | 3 | 6 | |
| A04 | `welding` | Welding & Fabrication | trades | yes | 3 | 6 | |
| A05 | `construction` | Construction Management | trades | yes | 3 | 6 | |
| A06 | `carpentry` | Carpentry & Framing | trades | yes | 3 | 6 | |
| A07 | `nursing` | Nursing | health | yes | 3 | 6 | notMedicalAdvice |
| A08 | `emt` | EMT / EMS | health | yes | 3 | 6 | notMedicalAdvice |
| A09 | `pharmacy` | Pharmacy | health | yes | 3 | 6 | notMedicalAdvice |
| A10 | `cybersecurity` | Cybersecurity | tech | no* | 3 | 6 | *treat as high-stakes |
| A11 | `it-support` | IT Support | tech | no | 3 | 6 | |
| A12 | `cnc` | CNC & Manufacturing | tech | yes | 3 | 6 | |
| A13 | `automotive` | Automotive | logistics | yes | 3 | 6 | |
| A14 | `energy` | Energy & Utilities | logistics | yes | 3 | 6 | |
| A15 | `culinary` | Culinary | business | yes | 3 | 6 | |

**Tier A count:** 15 industries  
**Pass-1 lessons:** 15 × 3 = **45**  
**Pass-2 lessons:** 15 × 6 = **90**

---

### Tier B — Breadth (full catalog claim)

| # | industryId | Display name | Sector | safetyFirst | Pass-1 | Pass-2 | Notes / edit |
|--:|------------|--------------|--------|:-------------:|-------:|-------:|--------------|
| B01 | `software` | Software Engineering | tech | no | 3 | 6 | |
| B02 | `data` | Data & Analytics | tech | no | 3 | 6 | |
| B03 | `quality` | Quality Assurance | tech | no | 3 | 6 | |
| B04 | `accounting` | Accounting | business | no | 3 | 6 | |
| B05 | `sales` | Sales | business | no | 3 | 6 | |
| B06 | `project-management` | Project Management | business | no | 3 | 6 | |
| B07 | `hospitality` | Hospitality | business | no | 3 | 6 | |
| B08 | `teaching` | Teaching | education | no | 3 | 6 | |
| B09 | `design` | Design | creative | no | 3 | 6 | |
| B10 | `video` | Video Production | creative | no | 3 | 6 | |
| B11 | `logistics` | Logistics | logistics | no | 3 | 6 | |
| B12 | `agriculture` | Agriculture | logistics | no | 3 | 6 | |

**Tier B count:** 12 industries  
**Pass-1:** 12 × 3 = **36**  
**Pass-2:** 12 × 6 = **72**

---

### Tier C — Civic / high-sensitivity (careful polish)

| # | industryId | Display name | Sector | safetyFirst | Pass-1 | Pass-2 | Notes / edit |
|--:|------------|--------------|--------|:-------------:|-------:|-------:|--------------|
| C01 | `civic-intelligence` | Public Information Literacy | public | no | 3 | 6 | OPSEC: no muni names |
| C02 | `media-literacy` | Media Literacy & Narrative Analysis | public | no | 3 | 6 | |
| C03 | `law-enforcement` | Law Enforcement | public | yes | 3 | 6 | careful authority language |
| C04 | `cdl` | CDL / Trucking | logistics | yes | 3 | 6 | |
| C05 | `aviation` | Aviation | logistics | yes | 3 | 6 | |

**Tier C count:** 5 industries  
**Pass-1:** 5 × 3 = **15**  
**Pass-2:** 5 × 6 = **30**

---

### Coverage math (all 32 industries)

| Pass | Per industry | Industries | Lessons |
|------|-------------:|-----------:|--------:|
| **Pass 1 — coverage** | 3 modes (explain, practice, scenario) | 32 | **96** |
| **Pass 2 — full mode set** | 6 modes | 32 | **192** |
| **Pass 3 — Tier A depth** | +6 extra uniques each (edit) | 15 | **+90** → **282** total if run |
| Pin seeds (always first) | reasoning tracks + spectrum | fixed | **6 + 32 = 38** (may overlap industry slots) |

**Recommended 3h target after 7am:** complete **Pin + Pass 1 + Pass 2 = 192 industry-mode slots** (plus 38 pins, deduped).  
**Stretch:** Pass 3 on Tier A only.

---

## 6. Execution order (strict queue)

### Phase 0 — Pins (before industry loop)

| Order | Item | Source | Action when cleaner runs |
|------:|------|--------|---------------------------|
| 0.1 | All reasoning-track lessons | `reasoning-tracks/` | Polish → `_polished` if not already CLEAN |
| 0.2 | All full-spectrum industry lessons | `full-spectrum/` | Polish → `_polished` |
| 0.3 | Snapshot baseline counts | logs | Write `POST7-BASELINE.json` |

### Phase 1 — Pass 1 coverage (Tier A → B → C)

For each industry in order **A01…A15, B01…B12, C01…C05**:

```text
for mode in [explain, practice, scenario]:
  select BEST unique file for (industryId, mode) across all sources
  if missing: log GAP
  else: enqueue polish job
```

**Stop condition for Phase 1:** all 32 × 3 slots filled or explicitly GAP.

### Phase 2 — Pass 2 full modes

Same industry order; modes `[socratic, quiz, career]` then any missing from Pass 1.

### Phase 3 — Tier A depth (optional stretch)

For A01–A15 only: add next-best unique lessons (any mode) up to **+6 per industry** (editable).

### Phase 4 — Final package

| Output | Contents |
|--------|----------|
| `public/corpus/_unique_queue/` | Manifest only or hardlinks of selected best files **before** polish |
| `public/corpus/_polished/` | Polished outputs (existing + new) |
| `READY-PUBLIC/` | CLEAN 12/12 only |
| `READY-INTERNAL/` | All unique polished for queue |
| `FINAL-COUNTS.md` | scanned / unique / dupes / CLEAN / soft / hard |

---

## 7. Per-slot selection algorithm (when sorting runs)

```text
INPUT: industryId, mode
CANDIDATES = all .md under corpus with frontmatter industryId+mode
             OR path under .../<industryId>/ and mode in name/frontmatter
DEDUPE by content hash against ENTIRE corpus index
RANK by source preference (section 3) then scoreMin then length
PICK top 1 (Pass 1/2) or top N (Pass 3)
RECORD: industryId, mode, path, hash, source, scoreMin, status=queued|gap
```

### Manifest schema (edit-friendly)

`C:\AOS\logs\corpus-post7\QUEUE-MANIFEST.jsonl` — one line per slot:

```json
{
  "slot": "A01-explain",
  "tier": "A",
  "industryId": "electrical",
  "mode": "explain",
  "pass": 1,
  "status": "queued|gap|polished|clean|skip",
  "sourcePath": "...",
  "hash": "...",
  "scoreMin": 9,
  "notes": ""
}
```

Also human table: `QUEUE-MANIFEST.md` (generated when sort runs).

---

## 8. Gap policy

| Situation | Action |
|-----------|--------|
| No file for industry×mode | `status=gap` — do not invent; optional generate later offline |
| Only near-dupes of another mode | Prefer true mode match; else mark gap |
| Only soak, no perfect | Use soak (rank 5) |
| Already CLEAN in polished | `status=clean` — skip re-polish, count toward coverage |

---

## 9. Reporting contract (every phase)

Always print **all four**:

```text
CLEAN_PASS=<n>       # public 12/12 on polished set under review
UNIQUE_QUEUED=<n>    # distinct hashes selected into queue
DUPES_SKIPPED=<n>    # candidates rejected as corpus-wide dups
GAPS=<n>             # industry×mode slots with no candidate
```

Plus coverage grid:

```text
industry × mode → queued|clean|gap
```

---

## 10. What runs when (timeline sketch after 7am)

| Clock (approx) | Activity | Cleaner? |
|----------------|----------|----------|
| 07:00 | Stop live writers; confirm freeze | **No** |
| 07:00–07:20 | Operator visual check / edit **this queue doc** | **No** |
| 07:20 | Operator **go** (optional edits applied) | — |
| 07:20–07:50 | **Sort only:** build full hash index + QUEUE-MANIFEST (32×6) | **No polish write** |
| 07:50–09:30 | Polish queue Pass 0→2 in tier order | **Yes** (only queued paths) |
| 09:30–10:00 | Final audit + READY-PUBLIC / READY-INTERNAL + counts | Audit only |

*Times editable. Sort-before-polish is mandatory in this map.*

---

## 11. Explicit non-actions (until you edit + approve)

- [ ] Do **not** start bulk `corpus-polish-clean` on random perfect offset  
- [ ] Do **not** delete raw 5M / soak trees  
- [ ] Do **not** require polishing all raw files  
- [ ] Do **not** ship public without OPSEC + morning E2E later  

---

## 12. Operator edit checklist

Edit this section before go:

| Edit | Default | Your value |
|------|---------|------------|
| Pass-1 modes | explain, practice, scenario | |
| Pass-2 modes | socratic, quiz, career | |
| Pass-3 extra per Tier A | +6 | |
| Move industry across tiers | as tables above | |
| Include soak in selection | yes (rank 5) | |
| Stop soak at 7am if still running | yes | |
| Output root | `public/corpus/_polished` | |
| Max wall time after go | ~3h | |

---

## 13. Full industry ID list (canonical, 32)

```
electrical, plumbing, hvac, welding, construction, carpentry,
nursing, emt, pharmacy,
software, cybersecurity, it-support, data, cnc, quality,
accounting, sales, project-management, culinary, hospitality,
law-enforcement, teaching, cdl, aviation, design, video,
energy, agriculture, automotive, logistics,
civic-intelligence, media-literacy
```

**Coverage requirement:** every ID above appears in Tier A, B, or C exactly once.

---

## 14. Related docs

- `docs/PLAN-3H-DEDUPE-POLISH.md` — earlier 3h mechanics  
- `docs/CORPUS-AUDIT-TEMPLATE.md` — A1–A12 + promote ladder  
- `docs/CORPUS-POLISH-FINDINGS-2026-08-07.md` — first-pass findings  
- `docs/POLISH-COUNTS.md` — where clean/dupe counts are written  

---

## 15. Approval block

```text
Operator reviewed:     [ ] yes
Edits made:            [ ] (describe above tables)
Approved to SORT only: [ ] after 7am freeze
Approved to CLEAN:     [ ] separate go (not yet)
Date/time:
```

---

*Map only. No cleaner start. Full industry coverage. Sort by tier → industry → mode → best unique source.*
