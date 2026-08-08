# Release stress suite

**At:** 2026-08-08T14:34:58.375Z
**Base:** http://127.0.0.1:8085
**Mode:** full
**Passed:** 18 / 20

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
| typecheck | PASS | exit=0 10714ms |
| partmode20 | PASS | exit=0 722ms |
| cad100 | PASS | exit=0 742ms |
| shape | PASS | exit=0 978ms |
| e2e50 | PASS | exit=0 3050ms |
| responsive50 | PASS | exit=0 1175ms |
| hive-dual | PASS | exit=0 1661ms |
| morning | FAIL | exit=1 1078ms |
| normie-sim | FAIL | exit=1 10824ms |
| sim200 | PASS | exit=0 38627ms |

Logs: `C:\AOS\logs\tutor-release-stress\*.log`
