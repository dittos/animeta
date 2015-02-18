# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from record.models import Record
from user.views import library

@login_required
def add(request, title=''):
    return library(request, request.user.username)

@login_required
def category(request):
    return library(request, request.user.username)

def update(request, id):
    record = get_object_or_404(Record, id=id)
    return library(request, record.user.username)

@login_required
def delete(request, id):
    record = get_object_or_404(Record, id=id)
    return library(request, record.user.username)
