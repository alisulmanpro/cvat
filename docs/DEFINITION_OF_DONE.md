# Definition of Done — Annotation Analytics in CVAT

Written before any code (unticked). Ticked at the end; **every tick has evidence beside it** (commit, file, command output or screenshot). A tick without evidence counts as not done.

Test data: task 1, 1000 COCO val images, 8109 shapes. Known answer: `person` = 2499, `chair` = 466, `car` = 416.

## Floor (items 1–4)
- [ ] `GET /api/test/tasks/1/label-counts` returns one row per label — evidence:
- [ ] Counts match the known answer (8109 total, person 2499) — evidence:
- [ ] Count is one grouped database query, not a Python loop (SQL shown) — evidence:
- [ ] Skeleton child shapes and non-annotation jobs are excluded — evidence:
- [ ] cvat-ui has a page for the task that calls the endpoint — evidence:
- [ ] Page shows the counts as a bar chart — evidence:
- [ ] Empty state: task with no annotations shows a clear message, not a broken chart — evidence:
- [ ] Error state: failed request shows an error message, page does not crash — evidence:

## Access (item 5)
- [ ] Request without login is refused (401) — curl output:
- [ ] Logged-in user without access to task 1 is refused (403/404) — curl output:
- [ ] Uses CVAT's existing `TaskPermission`; no new auth logic — evidence:

## Objective (item 6)
- [ ] MO-1 target written **before** measuring — `docs/OBJECTIVES.md`
- [ ] 5 runs measured, raw output pasted, median and spread reported — evidence:
- [ ] Machine, OS and CVAT SHA recorded next to the numbers — evidence:
- [ ] Result stated as met / missed, with reason — evidence:

## Beyond the floor
- [ ] Item 7: breakdown by shape type, with reason for choosing it — evidence:
- [ ] Item 8: graph updates live when annotations change — evidence / not done:
- [ ] Item 9: page recovers after the connection drops — evidence / not done:
- [ ] Item 10: decision record in `docs/PLAN.md` — evidence:

## Process
- [ ] First commit contains only `docs/PLAN.md` and this file
- [ ] Small commits after that; no `fix` / `wip`; each message says what and why
- [ ] No stray files, dead code, commented-out blocks or debug prints in the diff
- [ ] Changes outside `cvat/apps/test` and the new cvat-ui page are minimal and listed: 
- [ ] PR opened inside my fork (`dev-test01` → `main`), not against cvat-ai/cvat
- [ ] Loom under 5:00

## Not finished
_Everything not done is listed here with the reason._
