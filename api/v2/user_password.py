# -*- coding: utf-8 -*-
from api.v2 import BaseView


class UserPasswordView(BaseView):
    def post(self, request):
        if not request.user.is_authenticated():
            self.raise_error('Not logged in', 403)

        if not request.user.check_password(request.POST['old_password']):
            self.raise_error('Old password is wrong', 403)

        if request.POST['new_password1'] != request.POST['new_password2']:
            self.raise_error('New password confirmation failed', 400)

        request.user.set_password(request.POST['new_password1'])
        request.user.save()
        return {'ok': True}
