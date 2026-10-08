# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.urls import path

from .views import TaskLabelCountsView

urlpatterns = [
    path(
        "test/tasks/<int:task_id>/label-counts",
        TaskLabelCountsView.as_view(),
        name="test-task-label-counts",
    ),
]
