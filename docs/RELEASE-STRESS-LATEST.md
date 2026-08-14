# Release stress suite

**At:** 2026-08-14T17:21:18.464Z
**Base:** http://127.0.0.1:8085
**Mode:** quick
**Passed:** 14 / 15

| Check | Result | Detail |
| --- | --- | --- |
| HTTP / | PASS | 200 |
| HTTP /library | PASS | 200 |
| HTTP /labs/cad | PASS | 200 |
| HTTP /credits | PASS | 200 |
| HTTP /demo | PASS | 200 |
| HTTP /tutor | PASS | 200 |
| HTTP /help | PASS | 200 |
| HTTP /explore | PASS | 200 |
| HTTP /skills | PASS | 200 |
| HTTP /path | PASS | 200 |
| typecheck | PASS | exit=0 6404ms |
| partmode20 | FAIL | exit=3221226505 820ms |
| cad100 | PASS | exit=0 584ms |
| shape | PASS | exit=0 805ms |
| e2e50 | PASS | exit=0 1564ms |

Logs: `C:\AOS\logs\tutor-release-stress\*.log`
