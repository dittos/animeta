package net.animeta.backend.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class PeriodTest {
    @Test
    fun testJsonParse() {
        val period = jacksonObjectMapper().readValue<Period>("\"2014Q2\"")
        assertThat(period).isEqualTo(Period(2014, 2))
    }
}