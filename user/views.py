# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView, TemplateView
from django.contrib.auth.models import User
from django.contrib.auth.forms import PasswordChangeForm
from connect import get_connected_services
from record.models import History
from animeta.utils import call_api_internal, get_current_user


def shortcut(request, username):
    try:
        user = User.objects.get(username=username)
        return redirect(user)
    except User.DoesNotExist:
        return redirect('/%s/' % username)


def library(request, username=None):
    if not username:
        return redirect('user.views.library', username=request.user.username)

    owner = call_api_internal(request, '/users/' + username)
    current_user = get_current_user(request)
    include_has_newer_episode = current_user and current_user['id'] == owner['id']
    records = call_api_internal(request, '/users/' + username + '/records', {
        'include_has_newer_episode': 'true' if include_has_newer_episode else 'false'
    })

    return render(request, 'user/library.html', {
        'preload_data': {
            'owner': owner,
            'current_user': current_user,
            'records': records,
        },
    })

def history_compat(request, username):
    return library(request, username)

def history_detail_compat(request, username, id):
    get_object_or_404(History, user__username=username, id=id)
    return redirect('/-%s' % id)

class HistoryFeedView(ListView):
    template_name = 'user/history.atom'
    paginate_by = 20

    def get_queryset(self):
        self.user = get_object_or_404(User, username=self.kwargs['username'])
        return self.user.history_set.select_related('work', 'user')

    def get_context_data(self, **kwargs):
        context = super(HistoryFeedView, self).get_context_data(**kwargs)
        context['owner'] = self.user
        return context

    def render_to_response(self, context, **response_kwargs):
        response_kwargs['content_type'] = 'application/atom+xml'
        return super(HistoryFeedView, self).render_to_response(context, **response_kwargs)
