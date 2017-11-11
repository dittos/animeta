from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_work
from work.models import Work, TitleMapping


class WorkView(BaseView):
    def get(self, request, id=None, title=None):
        if not id:
            if not title:
                title = request.GET['title']
            id = get_object_or_404(TitleMapping, title=title).work_id
        work = get_object_or_404(Work, id=id)
        return serialize_work(work, request.user, full=True)
