package net.animeta.backend

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.jdbc.DataSourceInitializationMode
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import ru.yandex.qatools.embed.postgresql.EmbeddedPostgres

class TestDatabaseConfiguration {
    @Bean
    @Primary
    fun dataSourceProperties(embeddedPostgres: EmbeddedPostgres): DataSourceProperties {
        val properties = DataSourceProperties()
        properties.url = embeddedPostgres.connectionUrl.get()
        properties.initializationMode = DataSourceInitializationMode.ALWAYS
        return properties
    }

    @Bean(initMethod = "start", destroyMethod = "stop")
    fun embeddedPostgres(): EmbeddedPostgres {
        return EmbeddedPostgres()
    }
}