package net.animeta.backend.social

import org.springframework.http.MediaType
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.social.twitter.api.impl.TwitterTemplate
import org.springframework.web.client.RestTemplate

class TwitterTemplate2(a: String, b: String, c: String, d: String) : TwitterTemplate(a, b, c, d) {
    override fun configureRestTemplate(restTemplate: RestTemplate) {
        super.configureRestTemplate(restTemplate)
        restTemplate.interceptors.add(0, ClientHttpRequestInterceptor { request, body, execution ->
            request.headers.contentType = MediaType.APPLICATION_FORM_URLENCODED
            execution.execute(request, body)
        })
    }
}
