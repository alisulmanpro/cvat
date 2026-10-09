# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count

from cvat.apps.engine.models import JobType, LabeledShape, Task


def get_label_counts(task: Task) -> list[dict]:
    shape_counts = dict(
        LabeledShape.objects.filter(
            job__segment__task_id=task.id,
            job__type=JobType.ANNOTATION.value,
            parent__isnull=True,
        )
        .values_list("label_id")
        .annotate(count=Count("id"))
        .order_by()
    )

    counts = [
        {"label_id": label.id, "name": label.name, "count": shape_counts.get(label.id, 0)}
        for label in task.get_labels()
    ]
    return sorted(counts, key=lambda row: row["count"], reverse=True)
