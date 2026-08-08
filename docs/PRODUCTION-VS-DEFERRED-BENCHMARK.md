# Production product vs deferred — benchmark + test server

**At:** 2026-08-08T09:48:32.4191217-04:00  
**Target class:** `public-suite` (production product surface)  
**Test server:** **http://127.0.0.1:8085/** · **UP**  
**Vite WS:** ~646.3 MB (after slim publicDir fix)  
**Ship:** HOLD until OPSEC + human sample (thin product only)

---

## Separation principle

| Lane | What | Where | Noon ship? |
|------|------|-------|------------|
| **PRODUCTION PRODUCT** | App shell, Hive, Plan Lab, Credits, READY-PUBLIC curriculum | `src/` + slim static + `_training_material/READY-PUBLIC` | **Yes if gates green** |
| **DEFERRED CORPUS PIPE** | 5M perfect raw, full unique harvest/polish, bulk `_polished` soft-fails | `public/corpus/**` · harvest logs | **No** — keep running offline |

Do **not** let the multi-million-file corpus block the product test server.

---

## Test server (live now)

| Item | Value |
|------|--------|
| URL | http://127.0.0.1:8085/ |
| Start script | `C:\AOS\logs\Start-Tutor-8085.ps1` |
| Console log | `C:\AOS\logs\tutor-vite-console.log` |
| PID file | `C:\AOS\logs\tutor-server.pid` |
| publicDir (dev) | **`public-dev`** (soak junction only — no corpus) |
| publicDir (build) | `public` (unchanged) |
| Fix applied | Vite was OOMing (~4–6GB) watching `public/corpus`; now ignored + slim publicDir |

### Route benchmark (this host)

| Path | Status | Time (ms) | Notes |
|------|-------:|----------:|-------|
| `/` | 200 | ~155 | Hive home |
| `/labs/cad` | 200 | ~1117 | MAC + PartMode; PartMode markers present |
| `/credits` | 200 | ~279 | PartMode credit present |
| `/help` | 200 | ~142 | |
| `/path` | 200 | ~167 | |
| `/tutor` | 200 | ~676 | |
| `/skills` | 200 | ~398 | |
| `/soak/index.html` | 200 | ~37 | Observe surface |

### Gates just re-run

| Gate | Result |
|------|--------|
| `test:partmode20` (with server) | **PASS 12/12** |
| Typecheck (earlier) | **PASS** |

---

## PRODUCTION PRODUCT — in scope now

Work these for noon thin ship:

1. **App routes** on :8085 (Hive, Plan Lab, Credits, Help, Tutor, Skills, Path)  
2. **Plan Lab curriculum** — MAC 100 + PartMode 20 offline  
3. **READY-PUBLIC** educational pack — **273/274 CLEAN** (use as lesson library)  
4. **Credits / lineage** — MAC + PartMode + CAI-OS as configured  
5. **OPSEC + human visual** on product surfaces only  
6. **Build** `npm run build` for deploy artifact (uses full `public/` — may need corpus exclude strategy for deploy size; decide separately)  

### Production metrics (content quality)

| Metric | Value |
|--------|------:|
| Unique CLEAN (A1–A12) | **1100** |
| Hard fails | **0** |
| READY-PUBLIC files | 274 |
| READY-PUBLIC CLEAN | **273** |
| Plan Lab samples | **120** (100 MAC + 20 PartMode) |

---

## DEFERRED — keep separate (do not block product)

| Workstream | State now | Action |
|------------|-----------|--------|
| Full unique harvest | scanned **5090000** · unique **6765** · still running | Let finish in background |
| `_unique_all` export | Empty | After harvest summary |
| `_training_material_all` polish | Empty | After export |
| Raw perfect-overnight ~5M | On disk under `public/corpus` | **Do not** serve via Vite publicDir in dev |
| Bulk `_polished` ~27k soft A10 | Library of near-dups | Optional later cleanup |
| Live PartMode MCP / AGPL self-host | Map only | Phase 2 operator lab |
| Full multi-week polish of all uniques | Not started | Post-noon |

Harvest continues on separate node process — **do not kill** when restarting Tutor.

---

## Operator focus order (product lane)

1. Keep **http://127.0.0.1:8085/** up (restart: `powershell -File C:\AOS\logs\Start-Tutor-8085.ps1`)  
2. Human dual-monitor pass: Hive → Plan Lab (filter partmode families) → Credits  
3. `npm.cmd run test:cad100` + `test:morning` / e2e50 against :8085  
4. OPSEC gate on product tree  
5. Deploy **thin** product — not the 5M corpus  

---

## Restart notes

- If Vite climbs past ~2GB and freezes, confirm `publicDir` is `public-dev` for serve and corpus is not watched.  
- Harvest PID is independent (`corpus-all-unique`).  
- Production build may still copy `public/corpus` if present — for deploy, consider excluding corpus from the Vercel artifact (follow-up).

← noon report: `docs/NOON-GO-LIVE-READINESS.md` · PartMode: `docs/PARTMODE-AND-BOMWIKI-MAP.md`
