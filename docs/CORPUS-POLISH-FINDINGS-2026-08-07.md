# Corpus polish findings — first pass (soak sample)

**Date:** 2026-08-07 ~22:30 ET  
**Sample:** 400 random lessons from `public/corpus/balanced-soak/` (~15k on disk at audit)  
**Contrast:** 50 random `perfect-overnight` lessons  
**Template:** `docs/CORPUS-AUDIT-TEMPLATE.md`  
**Ship:** HOLD

---

## 1. What the soak is good at (keep)

From 400/400 sample:

| Signal | Rate | Note |
|--------|-----:|------|
| Educational banner + not-a-credential | 100% | Frontmatter + quote block |
| Dialogue + tools map + why-not + weak-shortcuts | 100% | Stable kit shell |
| Safety lexicon | 100% | Teaching notes / pack safety |
| Numbered steps | 100% | Practice/scenario/career especially |
| Learner agency language | 100% | Your job / reply / paste draft |
| OPSEC path / city leaks | **0%** | No `C:\Users`, `file://`, `City of` in sample |
| Overclaim regex | **0%** | No “you are licensed / guaranteed” hits |
| Frontmatter scores | 9–10 | scoreMin 9 (89%) / 10 (11%) |
| Mode mix | balanced | All 6 modes present in sample |

**Craft value is real when packs are strong** — e.g. electrical scenario (panel ground / temp power pressure) and nursing practice (stale note + family concern) read like usable drills, not empty slogans.

---

## 2. Polish required before *use* (not just storage)

### P1 — Treat soak volume as **coverage evidence**, not a public library

- LIVE may show 25k+ “lessons generated”; disk + dedupe collapse near-duplicates hard.  
- Many lessons share the same **shell** (routing → tools → dialogue stems → identical teaching-note blocks).  
- **Use after:** dedupe → auto gate → stratified human rubric → polishStatus.

### P2 — Raise structure to “perfect” floor for public tier

| Feature | Soak sample | Perfect sample (50) |
|---------|------------:|--------------------:|
| Explicit **Claim hygiene** section | ~87% (often only via teaching note) | **100%** dedicated section |
| **Actionable close** block | **0%** | **100%** |
| **Treatment of this information** | rare | **100%** |
| `notLegalAdvice` frontmatter | often missing | present |

**Polish:** backfill claim hygiene + actionable close + treatment block on any `ready-public` candidate (or regenerate from perfect compiler path).

### P3 — Public language / skill chrome

- **~65%** of soak sample still embed **internal skill ids** in body/frontmatter paths (`evidence-gate`, `shatter-protocol`, etc.).  
- Fine for internal QA; **not** for public sample UI (D-078 / OPSEC skill-chrome rule).  
**Polish:** map to public names in H1/body; keep ids only in frontmatter or strip for export.

### P4 — Operator chrome vs learner chrome

- Hive `shape` + `orchScenario` (e.g. `deep-cosmic-claim`, `star-burst`) are useful for **soak balance proof**, noisy for **learners**.  
**Polish:** demote to frontmatter / “For operators” footnote, or drop from public export.

### P5 — Template fatigue / thin topics

- Learner stems are MODE_STEM templates (“Drill me on {topic}…”).  
- Topics sometimes generic (`What to do first`) even when pack has richer topics.  
- Teaching notes often repeat the same four blocks (stop if unsafe / learning support / saw-think-guess / next step).  
**Polish:**  
  - Prefer pack-specific topics  
  - Craft-specific teaching notes only (drop pure boilerplate or inject pack facts)  
  - Optional third turn that *reacts* to a model learner answer (not only second mode stem)

### P6 — Encoding

- **~25%** of sample showed mojibake markers when inspected in some readers (`·` / arrows as `A�`).  
- Files are intended UTF-8; titles must render cleanly in product.  
**Polish:** normalize UTF-8 on write; audit titles for ``; fix export pipeline.

### P7 — Scoring inflation

- scoreMin 9–10 does **not** mean “ready-public.”  
- Current score rewards length, safety words, pack echo — not originality or non-duplication.  
**Polish:** public tier uses **rubric R1–R10** + duplicate gate, not scoreMin alone.

### P8 — Dedupe is mandatory

- Historical dedupe: tens of thousands scanned → low thousands unique.  
- Promoting without dedupe will ship the same lesson shell many times.  
**Polish:** SYSTEM_COUNTS unique set is the audit population.

---

## 3. Recommended polish pipeline (standard)

```text
raw soak/perfect
  → dedupe-corpus (unique + archive dups)
  → auto gates A1–A12 (CORPUS-AUDIT-TEMPLATE)
  → stratified human sample (industry × mode)
  → rubric R1–R10
  → polish pass (P2–P6)
  → re-gate
  → polishStatus: ready-internal | ready-public
  → OPSEC gate before any public host
```

**Priority order for human polish effort**

1. Reasoning tracks (6) + full-spectrum (32)  
2. Perfect-overnight unique (claim hygiene already present)  
3. Best-of soak unique (highest scoreMin + rare topics only)

---

## 4. What “done enough to use” means

| Use case | Minimum bar |
|----------|-------------|
| Overnight coverage claim | LIVE cycles + mode/shape balance + soft=0 |
| Internal partner review | unique set + auto A1–A7 pass |
| Public sample pack | ready-public + OPSEC + no skill chrome + no dups |
| Morning E2E | separate HTTP/product gates (not corpus volume) |

---

## 5. Next implementation (when you say go)

1. `scripts/corpus-polish-audit.mts` implementing A1–A12 + CSV report  
2. Optional rewriter: inject claim hygiene + actionable close + public skill names  
3. Export profile: `ready-public` only → share-pack folder  
4. Wire into morning suite as non-blocking report (blocking only if `--strict-corpus`)

---

*First-pass audit only · re-run when 5M / overnight freeze completes*
