# Verified currency layer · ITSHABBENING

**Not generative.** Operator-curated, dated, source-backed notes that the tutor injects when relevant.

**Package name:** **ITSHABBENING**  
**Private SuperGrok resource:** `C:\AOS\ops\ITSHABBENING`  
**Product embed:** `data/verified-notes.json` (PII-scrubbed, public-suite-safe)

Rebuild package + embed:

```bash
npx tsx scripts/build-itshabbening.mts
```

## What goes here

| Include | Do not include |
|---------|----------------|
| Stable safety habits | Invented codes or “always true” laws |
| Public educational concepts with limits | Private vault / densify / PII |
| Statements you can re-verify on a schedule | Marketing fluff |
| Clear **limits** + **sources** + **reviewBy** | Attack / exploit content |

## Tiers

- **must** — always when industry (or global) matches; safety-critical often here  
- **when_relevant** — topic/user-text hint match  
- **reference** — optional depth  

## How to update (operator workflow)

1. Edit `catalog.ts` (or add a new note object).  
2. Set `verifiedOn` to today; set `reviewBy` 3–12 months out.  
3. Fill `sources` with public labels (org, doc name).  
4. Run typecheck; smoke Learn offline for that industry.  
5. Optional: `listStaleVerifiedNotes()` in an audit script before publish.

## How the app uses it

- **Offline Learn** — appends a “Verified notes” block after the pack lesson.  
- **Live Grok** — same notes injected into the system prompt as non-negotiable currency.

Packs stay the teaching spine; verified notes are the **currency overlay** you manage deliberately.
