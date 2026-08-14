# Corpus audit template — soak / perfect sample lessons

**Status:** Draft standard (2026-08-07)  
**Product:** Grok Tutor · `public/corpus/**`  
**Ship:** HOLD — this template is for **pre-use polish**, not a public readiness claim  
**Companion findings:** `docs/CORPUS-POLISH-FINDINGS-2026-08-07.md`

---

## 1. Purpose

When continuous soak / perfect compile finishes, **do not ship raw volume**.  
Run this audit so every promoted lesson is:

- Educational, lawful, actionable  
- Accurate within pack scope (no invented place rules)  
- Free of OPSEC leaks and overclaims  
- Distinct enough to be useful (not a near-duplicate shell)  
- Labeled for treatment (evidence / inference / assumption · human final call)

---

## 2. Corpus layers (treat differently)

| Layer | Path | Role | Promote? |
|-------|------|------|----------|
| **A — Continuous soak** | `public/corpus/balanced-soak/` | High-volume coverage + balance proof | Only after dedupe + polish gate |
| **B — Perfect compile** | `public/corpus/perfect-overnight/` | Higher structure (claim hygiene, actionable close) | Preferred seed for public samples |
| **C — Full-spectrum** | `public/corpus/full-spectrum/` | One deep path per industry | High value; polish per industry |
| **D — Reasoning tracks** | `public/corpus/reasoning-tracks/` | Curated multi-turn tracks | Highest value; polish first |
| **E — Portable unique** | `C:\AOS\logs\tutor-corpus-portable\` | Deduped offline archive | Audit unique set, not raw volume |

**Rule:** Audit **unique post-dedupe** for ship candidates. Use raw soak counts only for coverage metrics.

---

## 3. Lesson frontmatter contract (required)

Every shippable `.md` lesson should expose:

```yaml
---
id: <stable-id>                    # optional but preferred
industryId: <id>
mode: explain|socratic|practice|quiz|scenario|career
skillId: <internal-id>             # keep internal; do not show raw in public UI
skillPublicName: <learner label>   # required for public
shape: <hive-shape>                # optional for public; operator-only ok
orchScenario: <id>                 # operator-only; strip or demote for public
topic: <human topic string>
scoreMin: <0-10>
repaired: true|false
generatedAt: <iso>
source: balanced-soak|perfect-overnight|full-spectrum|reasoning-tracks|human
educational: true
notACredential: true
notLegalAdvice: true
notMedicalAdvice: true             # when industry is care/health
opsecClean: true|false             # filled by auditor
polishStatus: raw|needs-polish|ready-internal|ready-public
polishNotes: ""
---
```

---

## 4. Rubric (score each lesson 0–2 per row)

**Pass thresholds**

| Audience | Min total | Hard fails (any = fail) |
|----------|----------:|-------------------------|
| Internal QA / coverage | 14 / 20 | OPSEC leak, overclaim, missing disclaimer |
| Public sample library | 17 / 20 | Same + skill-chrome leak + near-duplicate of another public lesson |
| Instructor / pack seed | 18 / 20 | Same + weak craft specificity |

### 4.1 Rubric rows (0 = missing, 1 = weak, 2 = solid)

| # | Dimension | 2 looks like | 0 looks like |
|---|-----------|--------------|--------------|
| R1 | **Disclaimer** | Educational; not credential/license; scope limits clear | No disclaimer or implies certification |
| R2 | **User-typical ask** | Learner prompt sounds like a real question | Empty stem / pure template noise |
| R3 | **Craft specificity** | Pack/industry facts, tools, mistakes named | Generic “be careful” only |
| R4 | **Actionable steps** | Numbered checks, who to tell, what to write | Vague encouragement only |
| R5 | **Safety / lawfulness** | Stop conditions; escalate; no illegal shortcuts | Encourages rush/skip/verify-skip |
| R6 | **Claim hygiene** | Evidence / inference / assumption (or saw/think/guess) | Mixes guess as fact |
| R7 | **Human final call** | Points to workplace SOP / licensed pro / official source | Tutor as final authority |
| R8 | **Learner agency** | Your job / reply / check understanding | Monologue only |
| R9 | **OPSEC** | No muni names, PII, host paths, secrets | Any of those present |
| R10 | **Public language** | Public skill labels; no ops skill brands in body | Raw `shatter-protocol` style chrome in learner-facing text |

**Total:** sum R1–R10 (max 20).

---

## 5. Automated gate checklist (machine)

Run against a folder (post-dedupe preferred):

| ID | Check | Fail if |
|----|-------|---------|
| A1 | Has YAML frontmatter | Missing `---` block |
| A2 | `educational: true` + not-credential language | Missing |
| A3 | Body length ≥ 2500 chars (soak) / ≥ 4000 (perfect/public) | Below |
| A4 | Contains `## Dialogue` (or equivalent multi-turn) | Missing |
| A5 | Safety lexicon if `safetyFirst` industry | Missing stop/safety language |
| A6 | No `C:\Users`, `file://`, `City of `, `County of ` | Match |
| A7 | No overclaim regex (`you are licensed`, `guaranteed`, `accredited by this`) | Match |
| A8 | Claim hygiene signal present | Missing for public tier |
| A9 | Actionable close **or** explicit next step | Missing for public tier |
| A10 | Near-duplicate: content hash / slot collision | Dup of kept unique |
| A11 | Encoding: no replacement-char mojibake in title (`�`) when read as UTF-8 | Broken glyphs |
| A12 | Internal skill ids only in frontmatter, not learner H1 if public | Public body shows ops ids |

**Implemented:**

```text
# single batch
npm run audit:polish -- --root balanced-soak --tier public --batch-size 1000 --offset 0

# all sources, batch runner until complete
powershell -File scripts/Run-Corpus-Polish-Audit-Batches.ps1 -BatchSize 1000 -Tier public

# outputs
#   scripts/sim-output/corpus-polish-audit/<runId>/
#   C:\AOS\logs\corpus-polish-audit\LATEST.json
#   C:\AOS\logs\corpus-polish-audit\BATCH-INDEX.jsonl
#   C:\AOS\logs\corpus-polish-audit\global-body-hashes.jsonl  (cross-batch A10)
```

---

## 6. Human sample audit sheet (copy per lesson)

```text
LESSON PATH:
INDUSTRY / MODE / TOPIC:
TIER TARGET: internal | public | pack-seed
AUTO SCORE (if any):
RUBRIC R1-R10:  / / / / / / / / / /   TOTAL: __/20
HARD FAIL? (opsec/overclaim/disclaimer): Y/N — note:
DUPLICATE OF?: path or none
POLISH ACTIONS (checklist):
  [ ] Fix encoding / punctuation
  [ ] Strip or demote hive/orch chrome for learners
  [ ] Public skill names only in body
  [ ] Add/strengthen claim hygiene block
  [ ] Add actionable close (4 steps)
  [ ] Replace thin topic with pack-real topic
  [ ] De-template teaching notes (craft-specific only)
  [ ] Verify safety-first industry language
  [ ] Verify no place names / PII
  [ ] Mark polishStatus in frontmatter
REVIEWER:
DATE:
VERDICT: reject | needs-polish | ready-internal | ready-public
```

---

## 7. Batch audit protocol (when run complete)

1. **Freeze** — stop generators or snapshot corpus folder.  
2. **Dedupe** — `dedupe-corpus.mts` → record SYSTEM_COUNTS.  
3. **Tier split** — unique set → candidates; raw soak → coverage archive only.  
4. **Auto gate** — A1–A12 on all unique files; export FAIL CSV.  
5. **Stratified human sample** — min **2 lessons × 32 industries × 6 modes = 384** (or 1×32×6=192 if time-boxed).  
6. **Score** with rubric §4; log mean / p10 / fail rate.  
7. **Polish pass** — fix FAIL + public-tier gaps (claim hygiene, actionable close, chrome).  
8. **Re-gate** — only `ready-public` may enter product sample library / share packs.  
9. **Brain dual-write** — update `13-RELEASE-SPRINT-STATUS` + WORKING-DOCUMENT with counts.

---

## 8. Promote rules

| polishStatus | Allowed use |
|--------------|-------------|
| `raw` | Coverage metrics only |
| `needs-polish` | Internal review queue |
| `ready-internal` | Dev demos, partner review, not public ship |
| `ready-public` | Product samples, share packs, gt2samples (after OPSEC gate) |

**Never** promote on token volume alone.

---

## 9. Related

- Treatment doctrine: educational · not accredited · tri-state claims · human final call  
- OPSEC: no muni / PII / secrets / operator skill brands in public UI  
- Existing tools: `scripts/dedupe-corpus.mts`, `scripts/corpus-quality-audit.mts` (packs/demo), soak scoreMin  
- Findings from first pass: `docs/CORPUS-POLISH-FINDINGS-2026-08-07.md`

---

*AdventureNLearn · process template · not a certification of corpus quality*
