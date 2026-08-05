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
npm run dev            # http://127.0.0.1:8080
```

Without an API key, the app still teaches using high-quality **offline educational replies**.

```bash
npm run typecheck
npm run build
```

## Stack

React 19 · TypeScript · Vite · TanStack Start / Router · Tailwind CSS v4 · Zustand  

Optional: `XAI_API_KEY` for server-side Grok tutoring (never expose keys in the browser or in git).

## Repository map

```text
src/
  routes/           App pages (Learn, Samples, Explore, Skills, Get yours, …)
  lib/
    industries.ts   Industry catalog (plain-language topics)
    demo/           Craft-specific sample lesson content
    demo-lessons.ts Lesson builder (multi-turn dialogues)
    aos-skills.ts   Thinking-tool map (tutor-safe subset)
    tutor-api.ts    Live + offline tutor
  components/       UI chrome
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

## Changelog note

**2026-08:** Repository replaced the earlier documentation-only layout with this full educational app source. The previous materials are frozen under [Grok-Tutor-AOS-Path-Archive](https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path-Archive).
