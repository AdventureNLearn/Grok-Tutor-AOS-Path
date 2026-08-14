---
tags: [aos, grok-tutor, public-suite, release-prep, dual-write]
status: active
updated: 2026-08-08
ship: HOLD
local_url: http://127.0.0.1:8085/
checkin: 2026-08-08T09:57-04:00
---

# Grok Tutor — release sprint status (host ↔ brain dual-write)

**Code truth:** `C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
**Local test:** http://127.0.0.1:8085/  
**Ship:** **HOLD** (thin product ready for human/OPSEC; not auto-public)  
**Partner mode:** D-091

---

## NOW — 2026-08-08 ~09:57 ET (production product lane)

### System up

| Item | State |
|------|--------|
| **Test server** | **UP** http://127.0.0.1:8085/ (Vite ready · ~580 MB · public-dev slim) |
| **Edge monitor** | **One window** opened to Hive home |
| Start helper | `C:\AOS\logs\Start-Tutor-8085.ps1` / WMI durable |
| Dev publicDir | `public-dev` (no multi-M corpus — prevents OOM) |

### Two lanes (do not mix)

| Lane | Contents | Status |
|------|----------|--------|
| **PRODUCTION PRODUCT** | Hive · Plan Lab (MAC 100 + PartMode 20) · Credits · app routes · READY-PUBLIC pack | **Server live — human observe now** |
| **DEFERRED CORPUS PIPE** | Overnight 5M raw · bulk polish soft-fails · full unique library polish | **Harvest pipeline COMPLETE** (see below) — promote later |

### Full unique harvest + polish (completed this morning)

| Metric | Count |
|-------:|------:|
| SCANNED | **5,093,972** |
| UNIQUE | **6,765** |
| DUPES | **5,087,207** (99.9%) |
| UNIQUE_POLISHED | **6,765** |
| CLEAN_PASS (pipeline) | **6,761** |
| Export | `public/corpus/_unique_all/` |
| Polished all | `public/corpus/_training_material_all/` |
| Logs | `C:\AOS\logs\corpus-all-unique\` |

### Public-tier CLEAN audit (earlier full scan of polished+training)

| Metric | Count |
|-------:|------:|
| Unique CLEAN 12/12 | **1,100** (hard=0) |
| READY-PUBLIC pack | **273 / 274** CLEAN after salvage |
| Soft remaining | A10 dups only (pre-salvage audit set) |

*Note:* Pipeline CLEAN_PASS 6761 is the all-uniques polish gate; the 1,100 figure is the earlier public A1–A12 audit of `_polished`+`_training_material`. Re-audit `_training_material_all` before treating 6761 as public-tier ship set.

### Product curriculum in the live app

| Surface | State |
|---------|--------|
| Plan Lab `/labs/cad` | MAC 100 + PartMode 20 literacy · credits wired |
| PartMode | Offline only — no AGPL kernel / no MCP keys |
| READY-PUBLIC | Coverage sample still primary thin-ship lesson pack |

### Gates

| Gate | Status |
|------|--------|
| Typecheck | PASS (post-PartMode) |
| test:partmode20 | PASS (12/12 with server) |
| Route bench (earlier) | Home/CAD/Credits/Help/… 200 |
| test:morning / e2e50 / build | **Pending** |
| OPSEC gate | **Pending** |
| Human dual-observe | **In progress** (one Edge window open) |
| Public deploy | **HOLD** |

### Blockers before public ship

1. Human visual pass on Hive + Plan Lab + Credits (this Edge window)  
2. `npm.cmd run test:morning` (or e2e50) green against :8085  
3. OPSEC: `Invoke-OpsecGate.ps1 -TargetPath C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
4. Explicit YES in WORKING-DOCUMENT for thin ship  
5. Optional: re-audit `_training_material_all` before promoting 6.7k set  

### Explicit defer (not noon blockers)

- Treating full 5M raw as public  
- Live PartMode MCP  
- AGPL monorepo embed  
- Re-running multi-hour bulk A10 soft-fail cleanup  

### Related cards

- [[Projects/Grok-Tutor/19-NOON-GO-LIVE-READINESS]]  
- [[Projects/Grok-Tutor/20-PRODUCTION-VS-DEFERRED-BENCHMARK]]  
- [[Projects/Grok-Tutor/18-PARTMODE-AND-BOMWIKI-MAP]]  
- [[Projects/Grok-Tutor/17-TRAINING-MATERIAL-LIBRARY]]  

---

## MORNING OUTCOME — 2026-08-08 ~07:20 ET (historical)

## MORNING OUTCOME â€” 2026-08-08 ~07:20 ET (training material)

**Dual-write:** this note Â· [[Projects/Grok-Tutor/17-TRAINING-MATERIAL-LIBRARY]] Â· `WORKING-DOCUMENT.md` Â· host `C:\AOS\logs\corpus-post7\`

| Track | Outcome |
|-------|---------|
| Perfect 5M | **COMPLETE** 5,000,000 Â· soft=0 |
| Continuous soak | Stopped at 7am handoff (~274k) |
| Training pipeline | **COMPLETE** |

### Training material counts

| Metric | Count |
|--------|------:|
| UNIQUE_QUEUED | **275** (0 gaps, 32 industries) |
| UNIQUE_POLISHED | **274** |
| DUPES_SKIPPED | **0** |
| CLEAN_PASS | **274** |
| READY-PUBLIC | **274** |

**Host store:** `public/corpus/_training_material/`  
**Queue map:** [[Projects/Grok-Tutor/15-POST-7AM-TIERED-POLISH-QUEUE]]  
**Library card:** [[Projects/Grok-Tutor/17-TRAINING-MATERIAL-LIBRARY]]

### Next

1. Human spot-check READY-PUBLIC (stratified industries)  
2. `npm run test:morning` when ready  
3. OPSEC before any public host  

---

## LIVE CHECK-IN â€” 2026-08-07 ~22:24 ET (historical overnight)

**Dual-write source:** host status at check-in Â· brain note this file Â· ops `WORKING-DOCUMENT.md`

### Continuous balanced soak (until 07:00)

| Field | Value |
|-------|--------|
| Status | **RUNNING** |
| PID | 16480 |
| Engine | `continuous-balanced-soak-sim-only` |
| Cycles / lessons | **24,480** |
| Pass / soft | 24,480 / **0** |
| LIVE age | ~0.1s (fresh) |
| LIVE path | `public/soak/LIVE.json` |
| Stop | Scheduled **2026-08-08 07:00** â†’ `AOS-Tutor-Prep-Stop-7am` |

### Perfect package 5,000,000 compile

| Field | Value |
|-------|--------|
| Status | **RUNNING** (detached + ensure) |
| PID | 21068 |
| Progress | **~151,000 / 5,000,000** (~**3.0%**) |
| Pass / soft / repairs | 151000 / **0** / **0** |
| Rate (recent) | ~650â€“700 lessons/sec |
| ETA (if rate holds) | ~**2 hours** from ~22:24 |
| Corpus | `public/corpus/perfect-overnight/` |
| Progress JSON | `C:\AOS\logs\perfect-overnight-progress.json` |
| Console | `C:\AOS\logs\perfect-overnight-5m-console.log` |
| Ensure task | `AOS-Tutor-Perfect-5M` every 3 min |
| Launch helper | `C:\AOS\logs\Start-Perfect-5M.ps1` |

**Note:** Earlier agent-shell launches died when stdout pipes closed; relaunched via `cmd start` detachment. Ensure task restarts if process dies before 5M.

### Prior quality packages (complete)

| Package | Lessons | Quality |
|---------|--------:|---------|
| Perfect multi-turn (earlier 50k run) | 50,016 | avg 9.1 Â· soft 0 |
| Full-spectrum | 32 industries | avg 9.32 Â· soft 0 |
| Reasoning tracks | 6/6 PASS | avg ~9.0â€“9.5 |
| Dedupe snapshot (earlier) | unique **1,173** of 34,723 scanned | portable under `C:\AOS\logs\tutor-corpus-portable` |

### Information treatment (locked)

Educational only Â· **not** accredited Â· user-typical comprehensive Q&A Â· actionable / technical / professional / **lawful** Â· Evidence / Inference / Assumption Â· **human final call** Â· no municipality names / PII Â· ship **HOLD**.

### Scheduled tasks (active)

| Task | Role |
|------|------|
| `AOS-Tutor-Ensure` | Restart soak if LIVE stalls |
| `AOS-Tutor-Dedupe-30m` | Corpus dedupe + portable mirror |
| `AOS-Tutor-Perfect-5M` | Keep 5M compile alive until complete |
| `AOS-Tutor-Prep-Stop-7am` | Quiet prep stack at 07:00; leave Vite if healthy |

### Disk

~**275 GB** free on C: Â· 5M corpus expected ~**40+ GB** when complete

### Corpus polish / audit (started 2026-08-07)

| Doc | Role |
|-----|------|
| Product template | `docs/CORPUS-AUDIT-TEMPLATE.md` |
| First-pass findings | `docs/CORPUS-POLISH-FINDINGS-2026-08-07.md` |
| Brain card | [[Projects/Grok-Tutor/14-CORPUS-AUDIT-AND-POLISH]] |

**Headline:** soak kits are good **coverage shells** (disclaimer, safety, agency, OPSEC-clean in sample) but need polish before **public use** â€” claim hygiene/actionable close floor, strip skill chrome, dedupe, rubric R1â€“R10. Perfect layer is the better public seed.

### Operator morning (unchanged)

1. **07:00â€“09:00** â€” visual check (Vite left up)  
2. **09:00â€“11:00** â€” `npm run test:morning`  
3. Human OPSEC + dual-observe if required â†’ ship gate only after matrix PASS  

---

## Overnight prep (auto-stops 07:00)

| Item | Plan |
|------|------|
| Keep-Tutor-Server / Vite :8085 | Keep alive; ensure task restarts if down |
| Continuous sim-only soak | `continuous-balanced-soak.mts --sim-only` until **07:00** |
| Perfect 5M compile | Detached mega run + `AOS-Tutor-Perfect-5M` ensure |
| Hard stop task | `AOS-Tutor-Prep-Stop-7am` â†’ `scripts/Stop-Tutor-Prep.ps1` |
| At 7am | Prep watchers killed; **Vite left up** if healthy |
| Operator window | **07:00â€“09:00** free for visual check |
| Sprint | **09:00â€“11:00** `npm run test:morning` |

Logs:

- `C:\AOS\logs\continuous-until-7am-master.log` / `continuous-until-7am-schedule.json`
- `C:\AOS\logs\perfect-overnight-progress.json` / `perfect-overnight-5m-console.log`
- `C:\AOS\logs\perfect-overnight\` (FINAL-REPORT, SUMMARY, HOURLY when compile finishes)
- `C:\AOS\logs\tutor-prep-stopped.json` (written at 7am stop)
- `C:\AOS\logs\ensure-tutor-prep.log` Â· `perfect-overnight-5m-ensure.log`

---

## Pre-sprint gates (2026-08-07 evening)

| Gate | Result |
|------|--------|
| Shape/orch contract | **39/39 PASS** |
| Public claims / OPSEC audit | **hard=0 soft=0 PASS** |
| E2E-50 | **51/51 PASS** |
| **Reasoning-track corpus** | **6/6 PASS** (avg scores ~9.0â€“9.5) â€” multi-turn sample lessons in `public/corpus/reasoning-tracks/` |
| Full morning conductor | **NOT YET** (starts 09:00; now includes reasoning-corpus as blocking) |
| 60m soak (prior) | **55 suites, 0 hard fail**, 525 soft (vite outage period) |

### Reasoning tracks (learner corpus)

Not HTTP port pings. Each track is a pedagogical path (explain/socratic/practice/â€¦) that writes a **usable `lesson.md`**.

| Track id | Focus |
|----------|--------|
| civic-claim-hygiene | Integrity / claim hygiene (public info literacy) |
| electrical-safety-ladder | Full 6-mode safety ladder |
| four-agent-field-ops | Multi-role coordination lesson |
| plumbing-practice-depth | Second trade depth |
| public-career-onboarding | Career path for civic-adjacent learners |
| hvac-safety-scenario | License-boundary / refuse-safely |

Regenerate: `npm run test:reasoning` Â· Catalog: `public/corpus/reasoning-tracks/INDEX.json`

### Full-spectrum pipeline (all crafts)

| Item | Detail |
|------|--------|
| Script | `scripts/full-spectrum-reasoning-pipeline.mts` Â· `npm run corpus:spectrum` |
| Coverage | **All 32 industries** with packs Â· 6 modes each (explainâ†’career) |
| Tools | Primary `aosAffinity` + why alternate tools wait |
| Repair | Weak turns re-prompted; suite **does not abort** |
| Overnight | `Run-FullSpectrum-Until.ps1` until **07:00** (cycles full/deepen) |
| Corpus | `public/corpus/full-spectrum/<industry>/lesson.md` |
| First run | **32/32 OK**, avg **9.32**, repairs 0, soft 0 |

### Balanced continuous soak (LIVE log + anti-lopsided)

| Item | Detail |
|------|--------|
| Engine | `scripts/continuous-balanced-soak.mts` Â· `npm run soak:balanced` |
| LIVE feed | Writes `public/soak/LIVE.json` (observe-log pulse) |
| Rotation | Least-used: industry, mode, skill, hive shape, orch scenario |
| Each cycle | Sample lesson + HTTP feature hits for current shape |
| UI | observe-log shows mode% / shape% / balance hint |
| Until | **07:00** then Stop-Tutor-Prep quiet window |

---

## Host progress not fully in older brain notes

| Deliverable | Location |
|-------------|----------|
| Keep-Tutor-Server | `scripts/Keep-Tutor-Server.ps1` Â· `npm run keep:server` |
| Shape contract | `scripts/e2e-shape-contract.mjs` Â· `npm run test:shape` |
| Public audit | `scripts/audit-public-claims.mjs` Â· `npm run audit:public` |
| Morning conductor | `scripts/e2e-morning-suite.mjs` Â· `npm run test:morning` |
| Runbook | `scripts/sim-output/MORNING-E2E-RUNBOOK.md` |
| Dual observe | `scripts/Open-Quad-Observe.ps1` Â· `Watch-Quad-Observe.ps1` |
| Grokathon pack | Desktop / `C:\AOS\logs\share-packs\Grokathon-*` |

---

## 09:00 checklist (operator)

1. Confirm Vite :8085 still 200 (if not: `npm run keep:server` or `npm run dev`)
2. Optional: `npm run open:observe` for dual-monitor look-right
3. `npm run test:morning` (or skip long soak: `$env:MORNING_SKIP="sim1h"`)
4. Read `scripts/sim-output/morning-e2e/LATEST.json` / `MATRIX.md`
5. Human OPSEC + visual sign-off â†’ open ship gate only if ready

**Blocking FAIL on morning matrix = no public narrative.**

---

## Separation (unchanged)

| | Brain / ops | Grok Tutor |
|--|-------------|------------|
| Class | private | public educational |
| Port | 8787 harness / 8080 Qwen | **8085** |
| Do not | Paste vault into Tutor git | Develop Tutor inside brain harness |

â† [[Projects/Grok-Tutor/00-Home]] Â· [[Projects/Grok-Tutor/09-EDITING-SESSION-STATUS]] Â· [[Projects/Grok-Tutor/10-HIVE-OPERATOR-ABILITY]]

---

## NOON PREP â€” 2026-08-08 ~09:35 ET

**Report:** [[Projects/Grok-Tutor/19-NOON-GO-LIVE-READINESS]] Â· host `docs/NOON-GO-LIVE-READINESS.md`

| Item | State |
|------|--------|
| PartMode Phase 1 scaffold | **Done** (20 samples + lab + credits + e2e static) |
| Typecheck | **PASS** |
| CLEAN unique | **1100** Â· READY-PUBLIC **273/274** |
| Harvest | ~4.48M scanned / ~6k unique Â· **alive** |
| Local :8085 | **DOWN** â€” start before E2E |
| OPSEC / human sample / morning suite | **Pending** (blockers for ship) |
| Ship | **HOLD** â€” thin public only if blockers green by noon |


