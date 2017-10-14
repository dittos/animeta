package net.animeta.backend

import net.animeta.backend.security.CurrentUserArgumentResolver
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.web.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
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

    @Configuration
    class WebMvcConfig(val currentUserArgumentResolver: CurrentUserArgumentResolver) : WebMvcConfigurerAdapter() {
        override fun addArgumentResolvers(argumentResolvers: MutableList<HandlerMethodArgumentResolver>) {
            argumentResolvers.add(currentUserArgumentResolver)
        }
    }
}