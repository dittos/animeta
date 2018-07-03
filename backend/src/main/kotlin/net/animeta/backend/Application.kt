package net.animeta.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import io.sentry.Sentry
import net.animeta.backend.dto.JsonToObjectConverter
import net.animeta.backend.security.CurrentUserArgumentResolver
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.serializer.UserSerializer
import net.animeta.backend.social.TwitterServiceProvider2
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.core.task.TaskExecutor
import org.springframework.format.FormatterRegistry
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.social.twitter.connect.TwitterServiceProvider
import org.springframework.stereotype.Component
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer


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
        return TwitterServiceProvider2(appId, appSecret)
    }

    @Bean
    fun backupTaskExecutor(): TaskExecutor =
            ThreadPoolTaskExecutor().apply { corePoolSize = 4 }

    @Configuration
    class WebMvcConfig(val currentUserArgumentResolver: CurrentUserArgumentResolver,
                       val objectMapper: ObjectMapper) : WebMvcConfigurer {
        override fun addArgumentResolvers(argumentResolvers: MutableList<HandlerMethodArgumentResolver>) {
            argumentResolvers.add(currentUserArgumentResolver)
        }

        override fun addFormatters(registry: FormatterRegistry) {
            registry.addConverter(JsonToObjectConverter(objectMapper,
                    UserSerializer.Options::class.java,
                    RecordSerializer.Options::class.java,
                    PostSerializer.Options::class.java))
        }
    }

    @Component
    class SentryInitializer (@Value("\${sentry.dsn:}") sentryDsn: String) {
        init {
            val logger = LoggerFactory.getLogger(this::class.java)
            if (sentryDsn.isNotEmpty()) {
                logger.info("Initialized Sentry: {}", sentryDsn)
                Sentry.init(sentryDsn)
            } else {
                logger.info("Not initializing Sentry: property sentry.dsn is not provided")
            }
        }
    }
}
