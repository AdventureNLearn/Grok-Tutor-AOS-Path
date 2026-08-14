# Grok Tutor — post-reboot polish & execution plan

**Armed with:** 11:00 reboot ticket (see reboot state)  
**Continue script:** `C:\AOS\ops\security\reboot\jobs\Continue-GrokTutor-AfterReboot.ps1`  
**Goal:** Stability run · full Hive up · personal explore · no thrash

---

## Phase 0 — Post-logon (automatic)

1. Security status snapshot  
2. Optional Magnitude fence smoke (FreshLocal profile jobs)  
3. **Grok Tutor continue job:**  
   - Ensure slim Vite on **:8085** (public-dev)  
   - Keep-Tutor-Server watchdog (hours)  
   - Open **one** Edge window on **secondary** display → Hive  
   - Write `C:\AOS\logs\tutor-post-reboot\BRINGUP.json`  

---

## Phase 1 — Stability (you explore; suite re-verify)

| Step | Command / action | Pass criteria |
|------|------------------|---------------|
| 1 | Browse Hive on secondary | Combs open desks; no freeze 5+ min |
| 2 | `npm.cmd run typecheck` | exit 0 |
| 3 | `npm.cmd run test:release:quick` | all green with server up |
| 4 | `npm.cmd run test:normie-sim` | local twin RELEASE BAR |
| 5 | Manual checklist | `docs/UI-TEST-CHECKLIST.md` |

**Do not** start 4-pane full sim soak until host holds HTTP 10+ min under light use.

---

## Phase 2 — Polish (code/process)

| Priority | Item |
|----------|------|
| P0 | Fix Vite hang under multi-connection (SSR/PGLite) — root of sim failure |
| P0 | `notFoundComponent` on root route (logged warning) |
| P1 | Production `vite build` green with `public-release` |
| P1 | Git identity + `scripts/Create-Release-Commits.ps1` |
| P2 | Re-audit `_training_material_all` (6.7k) before public promote |
| P2 | OPSEC gate: `Invoke-OpsecGate.ps1 -TargetPath` product tree |
| P3 | Full sim instance only after P0 stability |

---

## Phase 3 — Ship gate (HOLD until all)

- [ ] Stability 30+ min personal explore without freeze  
- [ ] test:release:quick green  
- [ ] OPSEC gate pass  
- [ ] Human visual sign-off (Hive · Library · Plan Lab · Credits)  
- [ ] Working Document YES for thin public  
- [ ] Deploy only after above  

---

## Commands cheat sheet (post-reboot)

```powershell
# Manual bring-up if auto-continue missed
powershell -File C:\AOS\ops\security\reboot\Invoke-PostRebootContinue.ps1

# Tutor only
powershell -File C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\scripts\Start-Grok-Tutor-Release.ps1

# Desktop
C:\AOS\desktop\Open-Grok-Tutor.cmd

# Stability suite
cd C:\Users\Chris\Projects\Grok-Tutor-AOS-Path
npm.cmd run test:release:quick
```

## Cancel reboot (if needed before countdown ends)

```powershell
shutdown /a
powershell -File C:\AOS\ops\security\reboot\Disarm-RebootTicket.ps1
```
