# Tutor browser crash log

**Host:** AOS control plane · Iris Xe  
**Status:** OPEN — Edge and Chrome for Testing die on Hive  
**Safe URL:** `/safe.html` or `/?safe=1`

## Incidents

| When | Browser | URL | Result | Suspected |
|------|---------|-----|--------|-----------|
| 2026-08-14 | Chrome for Testing | `/?view=3d` | Window died | Auto-3D + WebGL |
| 2026-08-14 | Edge | `/?view=3d` | Window died | Same |
| 2026-08-14 | Edge | `/?view=map` | Window died | Still probed WebGL on boot |
| 2026-08-14 | Edge `--disable-gpu` | `/?view=map&safe=1` | Operator: died again | Hive canvas / app shell, not only 3D |
| 2026-08-14 | Edge `--disable-gpu` isolation | `/safe.html` | **UP** | Static HTML survives |
| 2026-08-14 | Edge `--disable-gpu` isolation | `/help` | **UP** | App shell without Hive canvas survives |
| 2026-08-14 | Edge `--disable-gpu` isolation | `/?safe=1` | **UP** | Safe landing (no canvas) survives |

| 2026-08-14 | Edge `--disable-gpu` | `/?view=map` slim 8-room sitting | **OPERATOR CRASH** | Slim field not enough — canvas path still dies |

## Mapping (2026-08-14)

3D/map field is a **connected sitting** only: 8 rooms, plus at most one lesson, one craft, and a few lens tools. Full corpus stays on Samples / Industries / Library pages. Do not dump 32×43 nodes into WebGL.

## Catch

- Hive home no longer probes WebGL until 3D opt-in.
- `/?safe=1` skips Hive workspace entirely.
- `/safe.html` is static — no React.
- Isolation runs append `C:\AOS\logs\tutor-browser-crash.jsonl`.

## Do not

- Open `/?view=3d` on this host until an isolation row is green for Hive map.
