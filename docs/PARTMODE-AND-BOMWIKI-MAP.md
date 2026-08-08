---
tags: [aos, grok-tutor, partmode, bomwiki, cad, mcp, brain, map-first]
status: active
updated: 2026-08-08
ship: HOLD
class: pattern-lab
---

# PartMode + BOMWiki — brain map and Tutor incorporation

**Target class:** `pattern-lab` (research map; not public ship)  
**Live product:** https://partmode.com/  
**Org:** [BOMWiki](https://github.com/BOMWiki)  
**Related Tutor CAD lab (already live offline):** [[Projects/Grok-Tutor/07-MULTI-AGENT-CAD-MAP]] · `/labs/cad`

## Evidence (tri-state)

| Claim | Basis | Notes |
|-------|--------|------|
| PartMode is browser parametric CAD for humans + typed agents | **Evidence** | partmode.com + README; OpenCascade WASM / replicad / three.js |
| Source is AGPL-3.0 at BOMWiki/partmode | **Evidence** | GitHub license |
| Hosted MCP at `https://partmode.com/mcp` with agent keys | **Evidence** | partmode.com/help MCP reference |
| BOMWiki is separate BOM encyclopedia engine | **Evidence** | github.com/BOMWiki/bomwiki · bomwiki.com |
| Fits Tutor educational CAD literacy lane | **Inference** | Complements MAC Plan Lab; same integrity kernel |
| Safe to embed PartMode kernel in Tutor public shell | **Assumption — REJECT default** | AGPL copyleft + ship HOLD + no secret keys in product |

## What PartMode is (operator one-liner)

**Local-first parametric CAD in the browser**, exact B-rep, feature history, parts/assemblies, STEP-first I/O, with **permissioned typed agent access (MCP)** so humans and agents edit the **same document** — not screenshot/pointer automation.

Made by Sphinx (@protosphinx). Free to use; self-hostable (`npm ci && npm run build && npm start` → `http://127.0.0.1:4401`).

## BOMWiki org repos (public)

| Repo | Role | License |
|------|------|---------|
| [BOMWiki/partmode](https://github.com/BOMWiki/partmode) | Browser CAD + agent MCP surface | AGPL-3.0 |
| [BOMWiki/bomwiki](https://github.com/BOMWiki/bomwiki) | BOM encyclopedia engine (Node + Postgres) | AGPL-3.0 |
| BOMWiki/.github | Org profile assets | — |

**bomwiki.com** = shared graph of products → assemblies → parts (encyclopedia).  
**partmode.com** = design/edit those parts as exact geometry with agents.

They are **siblings**, not the same binary: BOM knowledge graph vs CAD studio.

---

## How it differs from Multi-Agent CAD (MAC) already in Tutor

| Dimension | **MAC** (Pan-Chera) | **PartMode** (BOMWiki) |
|-----------|---------------------|-------------------------|
| Already in Tutor? | Yes — offline Plan Lab `/labs/cad` | **No** (map only as of this card) |
| Local research clone | `C:\AOS\workspace\research\Multi-Agent-CAD` | Optional later under research (AGPL) |
| Runtime | Python / build123d / LangGraph pipeline | Browser WASM CAD + optional MCP |
| Agent model | Multi-agent **text → code → QA → repair** | Typed **ops on live document** (preview/commit) |
| Human authority | Repair loop + dual QA | **Session approval**, commit budget, visible studio |
| Public Tutor path | Offline samples only | Teach **process literacy**; deep-link or self-host later |
| License | MIT | **AGPL-3.0** (self-host / network copyleft care) |

**Do not collapse them.** MAC teaches *pipeline literacy*. PartMode teaches *live collaborative exact CAD + agent permissioning*.

---

## How to work well with PartMode (brain + operator)

### A. Human studio (default, safest)

1. Open https://partmode.com/ (or self-host :4401).  
2. Sketch → feature history → parameters → inspect mass/topology → export STEP.  
3. Use template library for standard parts demos.  
4. Keep training geometry **generic** (no customer PII, no real job files in public samples).

### B. Agent path (MCP) — security hierarchy first

| Layer | Rule |
|-------|------|
| **L0** | PartMode **agent keys never** to models, git, Tutor public, or chat logs |
| **L1** | Private operator experiments only on local/self-host or personal account |
| **L2** | Agent sandbox only; no headless grant unless explicit operator decision |
| **L4–L5** | Public Tutor **does not** ship live MCP keys or auto-commit CAD |

**Recommended agent workflow (from vendor help):**

1. Connect MCP client to `https://partmode.com/mcp` with key in env (`PARTMODE_AGENT_KEY`).  
2. `tools/list` + help resources (`partmode://help/...`).  
3. **Browser path (default):** `partmode_list_studios` → `partmode_connect` → **human approves** in visible tab.  
4. `cad_capabilities` (authoritative) → `cad_inspect` / `cad_query`.  
5. Mutations: build only advertised ops → **`cad_preview`** → review evidence → **`cad_commit`** (preview id + revision).  
6. Verify revision/hash/topology/mass → export → `partmode_disconnect`.

**Headless path:** only with explicit “Allow headless server sessions” on key; no UI/events; durable projects under account; use sparingly for AOS.

### C. Integrity kernel on CAD claims

| Gate | Application |
|------|-------------|
| Evidence | STEP hash, mass props, topology health, revision id |
| Inference | “Should fit” without measurement |
| Assumption | Material, load, code compliance without engineer |
| Human final call | Anything that could be manufactured / safety-critical |
| Clean-share | Generic training models only in Tutor public |

### D. BOMWiki (parts knowledge) — optional later

- Map products/assemblies as **curriculum graphs** (what a pump is made of), not live scrape into public.  
- Pair with PartMode: “BOM row → sketch a training stand-in part.”  
- OPSEC: no municipality equipment inventories in public packs.

---

## Tutor incorporation plan (phased)

### Phase 0 — Map (this card) ✅

Brain dual-write + credits awareness. No product merge.

### Phase 1 — Curriculum (no AGPL embed)

| Deliverable | Where | Notes |
|-------------|--------|------|
| “PartMode literacy” family in CAD samples | `src/lib/cad/` + `/labs/cad` | Offline: sketch → history → preview/commit metaphor → human approve |
| Hive comb card | `tutor-hive-map` | Link Plan Lab + external PartMode help (new tab) |
| Credits / lineage | `public-credits.ts` | Cite PartMode + BOMWiki AGPL; distinct from MAC MIT |
| Trades bridge | industries: cnc, welding, construction, automotive, quality, design | Lessons: claim hygiene on drawings/STEP, not “you are a PE” |
| Corpus polish | training material | Educational only; no agent keys |

**Teaching map (MAC stage → PartMode analogue):**

| MAC stage | PartMode analogue | Tutor teach-as |
|-----------|-------------------|----------------|
| Spec / CADBrief | Project intent + units | Context Priority |
| Architect plan | Feature history tree | Architect / tradeoff |
| Coder | Typed `cad_preview` ops | Builder (no fake geometry API in public) |
| Dual QA | `cad_inspect` / mass / topology | Drift Monitor |
| Repair | New preview from current revision | Iteration Coil |
| Export | STEP / drawing SVG | Deliver + clean-share |
| Human gate | Session approve + commit budget | Claim diamond / final call |

### Phase 2 — Operator lab (private)

| Action | Path |
|--------|------|
| Optional research clone | `C:\AOS\workspace\research\partmode` (AGPL; not Tutor git) |
| Self-host smoke | Node 22.13+ · port 4401 |
| MCP experiment | Local agent + browser approve only |
| Log outcomes | Brain session notes; **no keys** |

### Phase 3 — Product (only after Working Document decision)

| Option | When |
|--------|------|
| Deep-link “Open in PartMode” from Plan Lab | After OPSEC + license counsel on linking |
| Iframe / embed | **Default no** (AGPL + origin control + UX) |
| Bundle PartMode into Tutor monorepo | **Reject default** (AGPL infection risk on public suite) |
| Self-host PartMode beside Tutor on control plane | Operator-only; separate origin/port |
| BOMWiki graph as tutor “parts literacy” pack | New gated path; not LPIN map merge |

---

## What NOT to do

- Invent MCP tool schemas — call live `cad_capabilities`.  
- Put agent keys in Tutor env for public deploy.  
- Treat PartMode as SolidWorks/Fusion replacement or PE stamp.  
- Merge BOMWiki municipality/product scrapes into public samples.  
- Confuse PartMode with PartyMode (unrelated Kodi project).  
- Replace MAC Plan Lab — **compose**, don’t overwrite.

---

## Immediate operator checklist

1. Read https://partmode.com/help (human + MCP sections).  
2. Skim https://github.com/BOMWiki/partmode README + AGPL.  
3. Keep MAC Plan Lab as offline spine.  
4. Draft Phase 1 sample family (10–20) when CAD lab next open.  
5. If MCP test: new throwaway key, browser-approve only, revoke after.  
6. Revisit Phase 2 clone only with explicit WD decision.

## Related brain cards

- [[Projects/Grok-Tutor/07-MULTI-AGENT-CAD-MAP]] — MAC integration (done offline)  
- [[Projects/Grok-Tutor/06-PIN-REPLY-FEATURE-MAP]] — hive shapes  
- [[Projects/Grok-Tutor/08-PUBLIC-CREDITS-AND-LINEAGE]] — citation pattern  
- [[Projects/Grok-Tutor/17-TRAINING-MATERIAL-LIBRARY]] — corpus / CLEAN  
- Tool-building ADBL / MCP map-first doctrine under Tool-Building  

## Ship

**HOLD** for any public Tutor surface that claims live CAD or agent control.  
Educational mapping and credits are allowed under existing Tutor OPSEC.

← [[Projects/Grok-Tutor/00-Home]] · [[Projects/Grok-Tutor/07-MULTI-AGENT-CAD-MAP]]
