# Plan — Annotation Analytics in CVAT

Branch `dev-test01` · committed before any code · time box 8 h · acknowledged at `__:__` (deadline `__:__`)

| | |
|---|---|
| CVAT base commit | `28f5bffaf1b66b81c1e908d3ae626047a54279b0` (7 Oct 2026) |
| Machine | Intel Core i5-3437U (2 cores / 4 threads), 16 GB DDR3, Pop!_OS 24.04 LTS |
| Sample data | COCO 2017 val, first 1000 images (sorted by file name), one task (id 1), one annotation job |
| Known answer | 7204 COCO annotations imported as **8109 shapes** (multi-part polygons become separate shapes); `person` = 2499 shapes |

Setup (Docker stack, Python venv, cvat-ui dev server, COCO import) was done **before** acknowledging and is not counted in the time box.

## Goal
An endpoint that returns the per-label annotation count for a task, computed in the database, and a page in cvat-ui that shows it as a bar chart with empty and error states. Items 1–4 are the floor; nothing after item 4 starts until 1–4 work end to end.

## Approach
- **Backend:** new Django app `cvat/apps/test` (import path `cvat.apps.test`), registered in settings and URLs. `GET /api/test/tasks/<id>/label-counts` → `[{label_id, name, count}]`.
- **Count:** one grouped query on `LabeledShape`, filtered by `job__segment__task_id` (same pattern CVAT already uses in `engine/models.py`), grouped by label, `Count("id")`. Only top-level shapes (`parent__isnull=True`, so skeleton points are not counted) and only `job__type="annotation"` (so ground-truth and consensus-replica jobs do not double count). Labels with zero shapes are filled in from `task.get_labels()`.
- **Unit of count:** shapes, not COCO objects. Reason: it is what CVAT stores and what an annotator sees on screen. The 7204 → 8109 difference is documented, not hidden.
- **Auth:** reuse CVAT's own check: `TaskPermission` with scope `view:annotations`, evaluated by OPA. No new `.rego` rules.
- **Frontend:** new route in cvat-ui linked from the task page. Chart with `react-chartjs-2` + `chart.js`, already in `cvat-ui/package.json`, so no new dependency. Explicit loading, empty and error states.

## Order and time budget
| # | Work | Item | Budget |
|---|---|---|---|
| 1 | Commit this plan + unticked Definition of Done | docs | 0:20 |
| 2 | Scaffold `test` app, register app and URL | 1 | 0:30 |
| 3 | Count query, check against known answer (8109 / person 2499) | 1 | 0:45 |
| 4 | Endpoint + permission check | 1, 5 | 0:45 |
| 5 | UI route, page, API call | 2 | 1:00 |
| 6 | Bar chart, empty state, error state | 3, 4 | 0:45 |
| — | **Checkpoint 4:00 — items 1–4 working end to end** | | |
| 7 | Record 401 (no login) and 403 (other user) with curl | 5 | 0:20 |
| 8 | Objective MO-1: set target, 5 runs, raw output | 6 | 0:40 |
| 9 | Breakdown by shape type (`?group_by=type`) | 7 | 0:30 |
| — | **Checkpoint 6:00 — if behind, skip 10** | | |
| 10 | Live update + reconnect (stretch) | 8, 9 | 0:45 |
| 11 | Objectives, DoD evidence, decision record | 10 | 0:30 |
| 12 | Loom (< 5 min), PR inside my fork, reply | submit | 0:30 |

Small commits in this order; each message says what changed and why.

## Decided to skip
- Tracks (`LabeledTrack`) and tags (`LabeledImage`): not present in this data; the endpoint counts shapes only. Listed as a limitation.
- Counting COCO-style objects (merging shapes by `group`).
- Caching or a stored counter table unless MO-1 is missed.
- Items 8–9 if items 1–7 are not solid by hour 6.

## Risks
- How CVAT's default DRF permission classes treat a view outside `engine`; checked first in step 2.
- Live updates: CVAT has no obvious WebSocket layer, so 8–9 may not fit.
- Old 2-core CPU: builds and measurements are slow; MO-1 numbers are for this machine only.

## Changes to this plan
_Dated notes added here whenever the plan changes, with the reason._

## Decision record (filled in at the end)
- **Taken:** count on read with one grouped query.
- **Rejected:** a counter table updated on every annotation save.
- **Cost of rejecting it:** every request scans the task's shapes, so very large tasks are slower; in return there is no sync logic and counts can never drift from the real data.


(.env) alisulmanpro@pop-os:~/alisulmanworkspace/assessment/Annotation_Analytics_in_CVAT$ python manage.py shell -c "
from django.db import connection
from django.test.utils import CaptureQueriesContext
from cvat.apps.engine.models import Task
from cvat.apps.test.analytics import get_label_counts
with CaptureQueriesContext(connection) as ctx:
    rows = get_label_counts(Task.objects.get(id=1))
print('total:', sum(r['count'] for r in rows), 'labels:', len(rows))
print(rows[:3])
print('queries:', len(ctx))
print(ctx.captured_queries[-1]['sql'])
"
69 objects imported automatically (use -v 2 for details).

total: 8109 labels: 80
[{'label_id': 1, 'name': 'person', 'count': 2499}, {'label_id': 57, 'name': 'chair', 'count': 466}, {'label_id': 3, 'name': 'car', 'count': 416}]
queries: 3
SELECT "engine_label"."id", "engine_label"."task_id", "engine_label"."project_id", "engine_label"."name", "engine_label"(.(.env) alisulmanpro@pop-os:~/alisulmanworkspace/assessment/Annotation_Analytics_in_CVAT$
