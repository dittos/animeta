package net.animeta.backend.social

import org.springframework.social.twitter.api.Twitter
import org.springframework.social.twitter.connect.TwitterServiceProvider

class TwitterServiceProvider2(consumerKey: String, consumerSecret: String) : TwitterServiceProvider(consumerKey, consumerSecret) {

    override fun getApi(accessToken: String, secret: String): Twitter {
        return TwitterTemplate2(consumerKey, consumerSecret, accessToken, secret)
    }

}
