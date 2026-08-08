# Requirements: Simulation-only soak (no multi-window monitoring)

**Status:** Adopted for overnight throughput (2026-08-07/08)  
**Product:** Grok Tutor · `C:\Users\Chris\Projects\Grok-Tutor-AOS-Path`  
**Ship:** HOLD until morning E2E + human OPSEC; this doc is **process design**, not a public claim of readiness.

---

## 1. Problem

Dual-monitor **three Hive panes** (spine / integrity / four-agent) plus soak log:

- Consume CPU/GPU and Edge process budget  
- Do not improve **lesson corpus** quality  
- Can hang or die independently of the simulation engine  
- Observation is valuable for **visual lock-right**, not for continuous corpus generation  

We already have enough log evidence that:

- Modes, shapes, orch scenarios, and industries can be **rotated in software**  
- Sample lessons are produced offline via `offlineTutorReply`  
- LIVE.json is sufficient for a **single** log pane pulse  

## 2. Decision

| Mode | When | Windows | Workload |
|------|------|---------|----------|
| **SIM-ONLY** (default overnight) | Corpus growth until 07:00 | **Log pane only** (optional) | Lessons + coverage counters + LIVE.json |
| **FULL** | Visual lock-right / demo | Log + 3 Hive panes | Lessons + HTTP orch/shape hits + LIVE |
| **MORNING E2E** | 09:00–11:00 | Optional observe | Full conductor (blocking gates) |

**Default continuous run = SIM-ONLY** until 07:00.

## 3. Functional requirements

### 3.1 Simulation engine (must)

1. **R1** Rotate least-used: industry (all packs), mode (6), skill affinity, hive shape (8), orch scenario.  
2. **R2** Each cycle produces a **usable multi-turn sample lesson** under `public/corpus/balanced-soak/`.  
3. **R3** Write `public/soak/LIVE.json` every cycle (heartbeat at start + after lesson).  
4. **R4** Soft-repair weak turns; **never abort** the overnight loop on soft quality.  
5. **R5** Coverage % for modes/shapes/orch in LIVE for anti-lopsided monitoring.  
6. **R6** `--sim-only` skips multi-HTTP page loads (orch still recorded as metadata).  
7. **R7** Stall watchdog restarts engine if LIVE mtime exceeds threshold.  
8. **R8** Hard stop at **07:00** for operator check window before 09:00 E2E.

### 3.2 Monitoring windows (must / must-not)

9. **R9** Continuous corpus run **must not require** the three Hive Edge windows.  
10. **R10** Optional single **soak log** window may remain for operator confidence.  
11. **R11** Visual lock-right (3 panes) is a **separate** checklist step (e.g. 07:00–09:00 or pre-ship), not part of overnight sim.  
12. **R12** `Watch-Quad-Observe` must not force-reopen TR/BL/BR during SIM-ONLY overnight.

### 3.3 Speed / resource

13. **R13** SIM-ONLY cycle gap ≤ 100ms (vs ~250ms+ full).  
14. **R14** HTTP timeouts ≤ 4s when FULL mode is used.  
15. **R15** Prefer local `tsx` binary (no repeated `npm exec` download stalls).

### 3.4 Evidence for system growth

16. **R16** Lessons include tool map (why primary tools / why not peers) and mode dialogue.  
17. **R17** `COVERAGE.json` + LIVE coverage fields are the audit trail for balance.  
18. **R18** Morning E2E still runs shape contract, public audit, reasoning tracks, e2e50 (HTTP shell health separate from overnight sim).

## 4. Non-goals

- Not a substitute for dual-monitor **visual** sign-off before public ship  
- Not live-model training (offline pack path is intentional for deterministic corpus)  
- Not accreditation or “full coverage of all human learning” claims  

## 5. Implementation map (done / follow-up)

| Item | Status |
|------|--------|
| `continuous-balanced-soak.mts --sim-only` | **Done** |
| observe-log stale detection + fetch timeout | **Done** |
| Keep-Balanced-Soak watchdog | **Done** |
| Drop TR/BL/BR during overnight | **Operator + script** (this session) |
| Visual lock-right checklist 07:00–09:00 | **Documented** — run `npm run open:observe` only if needed |
| FULL mode for demos | `--sim-only` off |

## 6. Commands

```powershell
# Fast corpus overnight (no 3 Hive panes required)
tsx scripts/continuous-balanced-soak.mts --sim-only --stop-at 2026-08-08T07:00:00

# Watchdog
powershell -File scripts/Keep-Balanced-Soak.ps1 -StopAt 2026-08-08T07:00:00

# Optional single log pane
# Edge → http://127.0.0.1:8085/soak/observe-log.html

# Visual lock (manual, not overnight)
npm run open:observe
```

## 7. Acceptance

- LIVE.json `updatedAt` advances at least every 40s under watchdog  
- Mode coverage does not stick on one mode (all six appear within 32 cycles)  
- Lessons accumulate under `public/corpus/balanced-soak/`  
- No dependency on three Hive windows for overnight success  
- At 07:00 automation quiets for human review  

---

*AdventureNLearn · educational process requirement · not a public certification claim*
