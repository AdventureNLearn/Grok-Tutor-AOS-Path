# UI + feature test checklist (pre-live)

**Server:** http://127.0.0.1:8085/  
**Launcher:** `C:\AOS\desktop\Open-Grok-Tutor.cmd` (secondary display)  
**Ship:** HOLD until you sign off + OPSEC

## Automated (already run / re-run)

| Suite | Command | Notes |
| --- | --- | --- |
| Full stress | `npm.cmd run test:release` | HTTP routes + typecheck + e2e packs |
| Quick stress | `npm.cmd run test:release:quick` | Faster subset |
| Normie (local) | `npm.cmd run test:normie-sim` | PC+public twin on :8085 |
| Normie (live public) | `npm.cmd run test:normie-sim:public` | After deploy to gt2samples |
| Morning conductor | `npm.cmd run test:morning` | Skips 1h soak by default |

Latest stress summary: `docs/RELEASE-STRESS-LATEST.md` · logs `C:\AOS\logs\tutor-release-stress\`

## Manual UI (secondary Edge)

1. **Hive** `/` — combs load (3D or Map), open desks without crash  
2. **Library** `/library` — READY-PUBLIC / Plan Lab / CLEAN counts visible  
3. **Plan Lab** `/labs/cad` — MAC + PartMode sections, quiz works  
4. **Samples** `/demo` — industry pack opens  
5. **Learn** `/tutor` — mode/industry pick works  
6. **Credits** `/credits` — MAC + PartMode + CAI-OS  
7. **Help / Path / Skills / Explore / Progress** — 200 + usable  
8. No muni names / PII / secrets in chrome  

## Git (ready for commits)

- **167 paths staged** (corpus excluded by `.gitignore`)  
- **Cannot commit here:** git user.name/email not configured on this machine  
- Run after identity set:

```powershell
cd C:\Users\Chris\Projects\Grok-Tutor-AOS-Path
powershell -File scripts\Create-Release-Commits.ps1
```

Or review staged set:

```powershell
git diff --cached --stat
```

## Not in git (by design)

`public/corpus/**` · harvest dumps · `public-dev` / `public-release` junctions · sim-output · `.env`
