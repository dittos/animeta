package net.animeta.backend.security

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import django.Signing

@JsonIgnoreProperties(ignoreUnknown = true)
class DjangoAuthSession(@get:JsonProperty("_auth_user_id") val userId: String) {
    constructor() : this("")

    companion object : Signing.Serializer<DjangoAuthSession> {
        private val mapper = ObjectMapper()
        private val reader = mapper.readerFor(DjangoAuthSession::class.java)
        private val writer = mapper.writerFor(DjangoAuthSession::class.java)

        override fun deserialize(data: ByteArray): DjangoAuthSession {
            return reader.readValue(data)
        }

        override fun serialize(obj: DjangoAuthSession): ByteArray {
            return writer.writeValueAsBytes(obj)
        }
    }
}