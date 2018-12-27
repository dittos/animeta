package net.animeta.backend.service

import net.animeta.backend.model.TwitterSetting
import net.animeta.backend.model.User
import net.animeta.backend.repository.TwitterSettingRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import twitter4j.TwitterFactory
import twitter4j.auth.AccessToken
import twitter4j.auth.RequestToken
import twitter4j.conf.ConfigurationBuilder

@Service
class TwitterService(
    @Value("\${spring.social.twitter.app-id}") private val appId: String,
    @Value("\${spring.social.twitter.app-secret}") private val appSecret: String,
    private val twitterSettingRepository: TwitterSettingRepository
) {
    private val logger = LoggerFactory.getLogger(this::class.java)
    private val clientFactory = TwitterFactory(ConfigurationBuilder()
        .setOAuthConsumerKey(appId)
        .setOAuthConsumerSecret(appSecret)
        .build())
    private val unauthenticatedClient = clientFactory.instance

    data class OAuthRequestToken(val token: String, val tokenSecret: String, val authorizationUrl: String)

    fun getOAuthRequestToken(callbackUrl: String): OAuthRequestToken {
        val result = unauthenticatedClient.getOAuthRequestToken(callbackUrl)
        return OAuthRequestToken(result.token, result.tokenSecret, result.authorizationURL)
    }

    fun finishOAuthAuthorization(user: User, token: String, tokenSecret: String, oauthVerifier: String) {
        val requestToken = RequestToken(token, tokenSecret)
        val accessToken = unauthenticatedClient.getOAuthAccessToken(requestToken, oauthVerifier)
        val setting = user.twitterSettings.firstOrNull() ?:
            TwitterSetting(user = user, key = "", secret = "")
        setting.key = accessToken.token
        setting.secret = accessToken.tokenSecret
        twitterSettingRepository.save(setting)
    }

    fun removeOAuthAuthorization(user: User) {
        val twitterSetting = user.twitterSettings.firstOrNull() ?: return
        twitterSettingRepository.delete(twitterSetting)
    }

    fun updateStatus(user: User, body: String): Boolean {
        val setting = user.twitterSettings.firstOrNull() ?: return false
        val client = clientFactory.getInstance(AccessToken(setting.key, setting.secret))
        try {
            client.updateStatus(body)
            return true
        } catch (e: Exception) {
            logger.error(e.message, e)
            return false
        }
    }
}