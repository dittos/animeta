# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView, TemplateView
from django.contrib.auth import login as _login
from django.contrib.auth.models import User
from django.contrib.auth.views import login as login_view
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from connect import get_connected_services
from record.models import History
from api import serializers
import json

def login(request):
    if request.POST.has_key('remember'):
        request.session.set_expiry(3600 * 24 * 14)
    else:
        request.session.set_expiry(0)
    return login_view(request)

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            _login(request, user)
            request.session.set_expiry(0)
            return redirect(user)
    else:
        form = UserCreationForm()

    return render(request, 'registration/signup.html', {'form': form})

class SettingsView(TemplateView):
    template_name = 'user/settings.html'

    def get(self, request, *args, **kwargs):
        self.password_change_form = PasswordChangeForm(user=request.user)
        return super(SettingsView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.password_change_form = PasswordChangeForm(user=request.user, data=request.POST)
        if self.password_change_form.is_valid():
            self.password_change_form.save()
            messages.success(request, u'암호를 바꿨습니다.')
            return redirect('/settings/')
        return super(SettingsView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        return {
            'password_change_form': self.password_change_form,
            'services': get_connected_services(self.request.user),
        }

def shortcut(request, username):
    try:
        user = User.objects.get(username=username)
        return redirect(user)
    except User.DoesNotExist:
        return redirect('/%s/' % username)

def library(request, username=None):
    if username:
        user = get_object_or_404(User, username=username)
    else:
        return redirect('user.views.library', username=request.user.username)

    return render(request, 'user/library.html', {
        'owner': user,
        'preload_data': {
            'owner': serializers.serialize_user(user, request.user),
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'records': [serializers.serialize_record(r, include_has_newer_episode=user == request.user)
                for r in user.record_set.all()],
        },
    })

def history_compat(request, username):
    return library(request, username)

def history_detail_compat(request, username, id):
    get_object_or_404(History, user__username=username, id=id)
    return redirect('history-detail', id=id)

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
