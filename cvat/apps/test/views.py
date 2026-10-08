# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import Task
from cvat.apps.engine.permissions import TaskPermission
from cvat.apps.iam.permissions import get_iam_context

from .analytics import get_label_counts


class TaskLabelCountsView(APIView):
    # The default PolicyEnforcer needs an iam_permission_class mapped to view actions;
    # this view is not in that table, so the task permission is checked explicitly below.
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id: int):
        task = get_object_or_404(Task, pk=task_id)

        permission = TaskPermission(
            **get_iam_context(request, task),
            obj=task,
            scope=TaskPermission.Scopes.VIEW_ANNOTATIONS,
        )
        if not permission.check_access().allow:
            raise PermissionDenied("You do not have access to this task's annotations.")

        return Response(get_label_counts(task))
