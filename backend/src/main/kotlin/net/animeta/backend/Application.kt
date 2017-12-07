package net.animeta.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import net.animeta.backend.security.CurrentUserArgumentResolver
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.web.support.SpringBootServletInitializer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.social.twitter.connect.TwitterServiceProvider
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter



fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}

@SpringBootApplication
class Application : SpringBootServletInitializer() {
    override fun configure(builder: SpringApplicationBuilder): SpringApplicationBuilder {
        return builder.sources(Application::class.java)
    }

    @Bean
    @Primary
    fun objectMapper(builder: Jackson2ObjectMapperBuilder): ObjectMapper {
        val objectMapper = builder.createXmlMapper(false).build<ObjectMapper>()
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        return objectMapper
    }

    @Bean
    fun twitterServiceProvider(@Value("\${spring.social.twitter.app-id}") appId: String,
                               @Value("\${spring.social.twitter.app-secret}") appSecret: String): TwitterServiceProvider {
        return TwitterServiceProvider(appId, appSecret)
    }

    @Configuration
    class WebMvcConfig(val currentUserArgumentResolver: CurrentUserArgumentResolver) : WebMvcConfigurerAdapter() {
        override fun addArgumentResolvers(argumentResolvers: MutableList<HandlerMethodArgumentResolver>) {
            argumentResolvers.add(currentUserArgumentResolver)
        }
    }
}