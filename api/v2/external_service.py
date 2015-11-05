from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
import tweepy
from api.v2 import BaseView
from connect.models import TwitterSetting


class TwitterView(BaseView):
    def delete(self, request):
        self.check_login()
        setting = get_object_or_404(TwitterSetting, user=request.user)
        setting.delete()
        return {'ok': True}


class TwitterConnectView(BaseView):
    def get(self, request):
        if not request.user.is_authenticated():
            return self._js_callback_response(False)

        try:
            TwitterSetting.objects.get(user=request.user)
            return self._js_callback_response(True)
        except TwitterSetting.DoesNotExist:
            pass

        print request.build_absolute_uri(reverse('twitter-connect'))
        auth = tweepy.OAuthHandler(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
            callback=request.build_absolute_uri(reverse('twitter-connect')),
        )

        if 'request_token' in request.session:
            token = request.session['request_token']
            del request.session['request_token']
            auth.set_request_token(*token)
            try:
                auth.get_access_token(request.GET.get('oauth_verifier'))

                TwitterSetting.objects.create(
                    user=request.user, key=auth.access_token.key,
                    secret=auth.access_token.secret)
                return self._js_callback_response(True)
            except tweepy.TweepError:
                pass

        try:
            redirect_url = auth.get_authorization_url()
            request.session['request_token'] = (auth.request_token.key, auth.request_token.secret)
            return redirect(redirect_url)
        except tweepy.TweepError:
            return self._js_callback_response(False)

    def _js_callback_response(self, ok):
        return HttpResponse('''<script>
    opener.onTwitterConnect({});
    window.close()
</script>'''.format('true' if ok else 'false'))
