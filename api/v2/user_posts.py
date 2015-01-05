# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from api.v2 import BaseView
from api.serializers import serialize_post

class UserPostsView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        queryset = user.history_set.order_by('-id')
        if 'before_id' in request.GET:
            queryset = queryset.filter(id__lt=request.GET['before_id'])
        count = min(int(request.GET.get('count', 32)), 128)
        return [serialize_post(post, include_record=True)
            for post in queryset[:count]]
