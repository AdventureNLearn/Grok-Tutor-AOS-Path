# Grok Tutor — NOON GO-LIVE readiness report

**At:** 2026-08-08T09:37:00.6366175-04:00  
**Target class:** `public-suite` / Grok Tutor  
**Live URL (target):** https://gt2samples.grok.me  
**Local:** http://127.0.0.1:8085/  
**Code:** `C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
**Ship posture:** **HOLD until checklist green** (partner D-091)

---

## Executive snapshot (right now)

| Area | State | Noon risk |
|------|--------|-----------|
| Local dev server :8085 | **DOWN** | High — must start for E2E |
| Typecheck | **PASS** | Low |
| PartMode scaffold | **IN TREE** (20 samples + lab + credits) | Low |
| MAC Plan Lab 100 | **OK** (static pack) | Low |
| CLEAN unique public-tier | **1,100** (hard=0) | Medium — human sample still due |
| READY-PUBLIC pack | **273/274 CLEAN** (1 A10) | Medium |
| Full unique harvest | **~4.56M scanned · 6185 unique · alive=True** | Medium — polish after finish |
| `_unique_all` / `_training_material_all` | **Empty** | Medium — not required for thin ship |
| OPSEC gate | **Not run this morning on product path** | **Blocker** for public |
| Human dual-observe / visual lock | **Not signed** | **Blocker** |
| Git vs origin | **Dirty main** (many local mods) | Medium — decide deploy path |

**Hours to noon (local):** ~2.4 h

---

## What we just integrated (PartMode → production pipeline)

### Code (scaffold + wire)

| Deliverable | Path |
|-------------|------|
| Apply map | `src/lib/cad/partmode-apply-map.ts` |
| 20 literacy samples | `src/lib/cad/partmode-samples-20.ts` |
| Generator | `scripts/generate-partmode-samples-20.mjs` · `npm run gen:partmode20` |
| Lab UI | `src/routes/labs.cad.tsx` — MAC + PartMode section, catalog 120 |
| Credits | `PARTMODE_CITATION` + PUBLIC_CREDITS entry |
| Hive comb | Plan Lab meta **120 samples · offline** |
| E2E | `npm run test:partmode20` (static **PASS**) |
| Brain map | `18-PARTMODE-AND-BOMWIKI-MAP` (Phase 1 scaffolded) |

### Pipeline position

`Plan Lab curriculum` → (offline) MAC 100 + PartMode 20  
`Training material` → READY-PUBLIC 274 (salvaged)  
`Full unique harvest` → still running → later polish to `_training_material_all`  
**Does not block thin noon ship** if Plan Lab + existing app routes pass OPSEC/E2E.

### Explicit non-goals for noon

- No AGPL PartMode kernel embed  
- No MCP agent keys in product  
- No claim of live CAD inside Tutor  
- No municipality / PII in samples  

---

## Full production pipeline status

### A. Curriculum / product surfaces

| Surface | Status | Notes |
|---------|--------|------|
| Hive home | In code | Local server down — verify after start |
| Plan Lab /labs/cad | **MAC 100 + PartMode 20 wired** | Typecheck pass; HTTP pending server |
| Credits | PartMode credit added | Auto-lists via PUBLIC_CREDITS |
| Industry lessons / tutor | Corpus on disk | READY-PUBLIC pack primary public lesson store |
| Soak LIVE | Overnight stopped 7am | Historical |

### B. Corpus quality

| Metric | Value |
|--------|------:|
| Combined unique CLEAN (A1–A12) | **1100** |
| Soft (A10 dups only) | ~26891 |
| Hard fails | **0** |
| READY-PUBLIC CLEAN | **273/274** |
| Salvage | Structure `---#` fixed; A12 cleared |

### C. Full unique harvest (background)

| Metric | Value |
|--------|------:|
| Scanned | **4560000** |
| Unique | **6185** |
| Alive | **True** |
| Export `_unique_all` | Not yet |
| Polish all uniques | Not yet |

**ETA:** remaining ~6 min at ~2k/s if rate holds (order-of-magnitude).  
**Noon decision:** ship **without** waiting for full 5M unique polish if thin surface is ready; promote full library post-noon.

### D. Verification gates

| Gate | Command / action | Status |
|------|------------------|--------|
| Typecheck | `npm.cmd run typecheck` | **PASS** |
| PartMode static E2E | `npm.cmd run test:partmode20` | **PASS** |
| CAD100 static | pack OK; HTTP fail (server down) | Partial |
| Morning suite | `npm.cmd run test:morning` | **NOT RUN** |
| Normie sim | `npm.cmd run test:normie-sim` | **NOT RUN** |
| E2E50 | `npm.cmd run test:e2e50` | **NOT RUN** |
| OPSEC | `Invoke-OpsecGate.ps1 -TargetPath <tutor>` | **NOT RUN** |
| Build | `npm.cmd run build` | **NOT RUN** |
| Local smoke :8085 | start + browse Hive + CAD + credits | **NOT RUN** |
| Human sample READY-PUBLIC | stratified industries | **NOT DONE** |
| Visual dual-monitor look-right | operator | **NOT DONE** |

---

## Path to READY at noon — ordered checklist

### Must-do (blockers)

1. **Start local Tutor** on 8085 and keep it up  
   - Use existing desktop launcher or `npm.cmd run dev` / project start script  
2. **Run verification matrix** (record logs under `C:\AOS\logs\tutor-noon-golive\`):  
   - `npm.cmd run typecheck`  
   - `npm.cmd run test:partmode20`  
   - `npm.cmd run test:cad100`  
   - `npm.cmd run test:morning` (or minimal e2e50 if morning too heavy)  
   - `npm.cmd run build`  
3. **OPSEC gate** on product tree:  
   `powershell -File C:\AOS\ops\gates\Invoke-OpsecGate.ps1 -TargetPath C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
4. **Human spot-check** READY-PUBLIC: ≥8 industries, both Tier A + one soft edge; no muni/PII; disclaimer present  
5. **Human visual** Hive + Plan Lab (MAC + PartMode section) + Credits on dual-monitor  
6. **Deploy decision**: which host path ships (gt2samples.grok.me triangle) — only after 1–5 green  
7. **Working Document** sign-off line: noon ship YES/NO + who approved  

### Should-do (same window if time)

8. Refresh READY-PUBLIC-BY-INDUSTRY catalog from post-salvage CLEAN  
9. Let harvest finish; start polish uniques **after** ship freeze if still running  
10. Confirm no secrets in `.env` / client bundle  
11. Update brain `13-RELEASE-SPRINT-STATUS` with noon outcome  

### Explicit defer (post-noon OK)

- Full `_training_material_all` from multi-million unique harvest  
- Live PartMode MCP / self-host on control plane  
- AGPL research clone under workspace  
- Expanding PartMode samples beyond 20  

---

## Thin vs full ship definitions

| Mode | Includes | Noon feasible? |
|------|----------|----------------|
| **Thin public** | App shell + Hive + Plan Lab (120) + Credits + READY-PUBLIC educational set | **Yes if blockers green** |
| **Full corpus** | All unique polished CLEAN from overnight 5M | **No** — harvest/polish incomplete |
| **Live CAD** | PartMode MCP in product | **No** — map-only by design |

**Recommendation:** Aim **thin public** at noon; label educational-only; HOLD full corpus promote until harvest+polish+OPSEC complete.

---

## Risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Server/E2E not run before deploy | High | Block ship until matrix green |
| OPSEC not run | High | Gate script mandatory |
| Overclaim CLEAN 274 vs 273 | Med | Use post-salvage numbers only |
| AGPL confusion (shipping PartMode) | Med | Credits + UI say offline literacy only |
| Dirty git / un-reviewed changes | Med | Deploy known revision; no drive-by |
| Harvest dies mid-perfect | Low | Durable resume already in place |
| Noon clock slip | Med | Thin ship cut line at T-30 min |

---

## Information treatment (locked)

Educational · not accredited · Evidence / Inference / Assumption · human final call · no muni names · no PII · no operator skill brands in public UI · no agent keys in product.

---

## Artifact index

- This report: `docs/NOON-GO-LIVE-READINESS.md`  
- PartMode map: `docs/PARTMODE-AND-BOMWIKI-MAP.md`  
- Salvage: `docs/SALVAGE-1012-REPORT.md`  
- CLEAN: `docs/CLEAN-NOW.md`  
- Logs: `C:\AOS\logs\tutor-noon-golive\` · harvest `C:\AOS\logs\corpus-all-unique\`  
- Brain: `Projects/Grok-Tutor/19-NOON-GO-LIVE-READINESS.md`

**Next operator action:** Start :8085 → run verification matrix → OPSEC → human sample → YES/NO at T-30.
