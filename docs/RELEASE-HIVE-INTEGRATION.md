---
tags: [aos, grok-tutor, release, hive, launcher]
status: active
updated: 2026-08-08
ship: HOLD
local_url: http://127.0.0.1:8085/
---

# Grok Tutor — full release Hive integration

## Launcher

| Item | Path |
|------|------|
| Desktop | `C:\AOS\desktop\Open-Grok-Tutor.cmd` |
| Script | `scripts/Start-Grok-Tutor-Release.ps1` |
| npm | `npm run start:release` / `npm run tutor:open` |
| Behavior | Durable Vite on :8085 · Edge on **secondary** display only · Keep-Tutor-Server watchdog |

## Hive workspace combs (professional)

| Comb | Route | Role |
|------|-------|------|
| Live session | `/tutor` | Guided craft lesson |
| Sample lessons | `/demo` | Multi-turn industry packs |
| **Training library** | `/library` | Release curriculum hub (NEW) |
| Industries | `/explore` | Craft catalog |
| Thinking tools | `/skills` | Tutor-safe skills |
| Your path | `/path` | Onboarding path |
| Progress | `/progress` | Local notes |
| How to use | `/help` | Guide |
| **Plan Lab · MAC + PartMode** | `/labs/cad` | 120 offline CAD literacy samples |
| **Credits & lineage** | `/credits` | MAC · PartMode · CAI-OS |

HUD label uses `release-curriculum.ts` counts (READY-PUBLIC CLEAN, Plan Lab total, public CLEAN unique).

## Code map

| Module | Purpose |
|--------|---------|
| `src/lib/release-curriculum.ts` | Release numbers + HUD line |
| `src/routes/library.tsx` | Library surface |
| `src/lib/tutor-hive-map.ts` | Workspace combs + HUD |
| `src/lib/cad/partmode-*` | PartMode literacy |
| `vite.config.ts` | `public-dev` / `public-release` slim static (no multi-M corpus) |

## Build note

Production `publicDir` = `public-release` (soak only). Do not use full `public/` for Vite build/deploy.

## Ship

**HOLD** until OPSEC + human visual. Product lane is integrated and testable on :8085.

← [[Projects/Grok-Tutor/13-RELEASE-SPRINT-STATUS]] · [[Projects/Grok-Tutor/00-Home]]
