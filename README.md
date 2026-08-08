# Grok Tutor

**Craft learning with thinking tools** — an educational development resource for learners and builders.

| | |
|---|---|
| **Live prototype** | [gt2samples.grok.me](https://gt2samples.grok.me/) |
| **This repository** | Source for the live prototype and a base for your own copy |
| **Earlier docs-only path** | [Grok-Tutor-AOS-Path-Archive](https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path-Archive) (archived) |

## What this is

A browser-based **tutor** for real jobs and trades: plumbing, electrical, nursing, software, and many more.

- **Sample lessons** — full multi-turn simulations per industry (plain language, craft-specific)
- **Live Learn** — guided modes: Explain, Socratic, Practice, Quiz, On-the-job, Career path
- **Thinking tools** — optional careful-thinking lenses mapped from public Adventure OS libraries
- **Progress** — sessions and notes stay in the learner’s browser when using local storage

This repo is an **educational development resource**: study it, fork it, remix it under your own account. It is not a support desk, credential program, or legal/medical authority.

## What this is not

- Not offensive security training or attack playbooks  
- Not a replacement for licensed instruction, codes, or clinical protocols  
- Not a dump of private ops material — public educational content only  

## Quick start (local)

```bash
npm install
cp .env.example .env   # optional: add XAI_API_KEY for live model replies
npm run dev            # http://127.0.0.1:8085  (or: npm run start:release)
```

Without an API key, the app still teaches using high-quality **offline educational replies**.

```bash
npm run typecheck
npm run build
```

**The Hive** (home): Map-first craft field; optional 3D. Click a comb to open a floating desk.
Deep-link 3D: `http://127.0.0.1:8085/?view=3d`

## Stack

React 19 · TypeScript · Vite · TanStack Start / Router · Tailwind CSS v4 · Zustand · Three.js (optional Hive 3D)

Optional: `XAI_API_KEY` for server-side Grok tutoring (never expose keys in the browser or in git).

## Repository map

```text
src/
  routes/              App pages (Learn, Samples, Library, Explore, Plan Lab, …)
  components/hive/     The Hive (Map + 3D, desks, coach)
  lib/
    industries.ts      Industry catalog (plain-language topics)
    demo/              Craft-specific sample lesson content
    tutor-hive-map.ts  Hive comb graph
    release-curriculum.ts  Public curriculum counts
    tutor-api.ts       Live + offline tutor
scripts/               Local launchers + stress helpers (host tooling)
docs/                  Product notes (ops soak logs stay host-local)
```

## Related public libraries

| Resource | URL |
|----------|-----|
| Adventure OS (AOS-v3---LPIN) | https://github.com/AdventureNLearn/AOS-v3---LPIN |
| AOS Public | https://github.com/AdventureNLearn/AOS-Public |
| LPINv3 | https://github.com/AdventureNLearn/LPINv3 |
| Earlier Grok Tutor (reference only) | https://groktutor.grok.me/ |
| Archived docs-only path | https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path-Archive |

## Get your own

On Grok.me (SuperGrok), open **Get your own** in the live app or use the build prompt on `/get-yours` so your learners use **your** access and quota.

## Safety & education

- Trades and health modes lead with **stop-if-unsafe** habits  
- Samples use **plain language** for people with little or no experience  
- Security topics stay on **protective practice and concepts**, not exploitation  

## License

MIT — see [LICENSE](LICENSE).

## Credits & lineage (public)

Full in-app page: **`/credits`**. Machine-readable notices: [NOTICE](NOTICE).

Product chrome stays clean (craft learning first). Attribution is explicit on Credits / NOTICE / this README.

### CAI-OS (conceptual spark — not code merge)

CAI-OS / CAIOS (Jonathan M. Schack · ELXaber) helped spark AOS/LPIN integrity framing. **Grok Tutor does not ship CAIOS software.** Exact creator-requested strings:

> Built on CAIOS v1.0 by inventor Jonathan M. Schack – Patent Pending US 19/433,771 & 19/390,493 – www.cai-os.com

> Built on CRB 6.7 by Jonathan Schack (ELXaber) (GPL 3.0).

> Chaos-Persona framework by ELXaber (https://github.com/ELXaber/chaos-persona/).

- https://cai-os.com · https://github.com/ELXaber/chaos-persona · jon@cai-os.com

### Multi-Agent CAD (educational Plan Lab)

Offline Plan Lab curriculum is aligned with MAC (browser does not run the Python CAD kernel):

```bibtex
@misc{mac2026,
  author = {Guanxing Qu and Xueyan Zou},
  title  = {MAC (Multi-Agent CAD): A Decoupled Multi-Agent Framework for Text-to-CAD Generation},
  year   = {2026},
  publisher = {GitHub},
  journal   = {GitHub repository},
  howpublished = {\url{https://github.com/Pan-Chera/Multi-Agent-CAD}}
}
```

Copyright (c) 2026 Tsinghua University · IEI Lab · MIT. Also cite [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) when using that baseline lineage.

### Runtime open source

See [NOTICE](NOTICE) and `/credits` (three.js, React, TanStack, Vite, Tailwind, Zustand, Zod, Lucide, Sonner, PGLite, Better Auth, and others).

## Changelog note

**2026-08:** Repository replaced the earlier documentation-only layout with this full educational app source. The previous materials are frozen under [Grok-Tutor-AOS-Path-Archive](https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path-Archive).
