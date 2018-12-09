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
import org.apache.tomcat.util.http.LegacyCookieProcessor
import org.jetbrains.exposed.sql.Database
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.boot.web.embedded.tomcat.TomcatContextCustomizer
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.PropertySource
import org.springframework.core.task.TaskExecutor
import org.springframework.format.FormatterRegistry
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.social.twitter.connect.TwitterServiceProvider
import org.springframework.stereotype.Component
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import javax.sql.DataSource

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}

@SpringBootApplication
@PropertySource("classpath:/common.properties")
class Application {
    @Bean
    fun database(dataSource: DataSource): Database {
        return Database.connect(dataSource)
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

    @Bean
    fun cookieProcessorCustomizer(): WebServerFactoryCustomizer<TomcatServletWebServerFactory> {
        return WebServerFactoryCustomizer { factory ->
            factory.addContextCustomizers(TomcatContextCustomizer { context ->
                context.cookieProcessor = LegacyCookieProcessor() })
        }
    }

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
