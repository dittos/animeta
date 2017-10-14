package net.animeta.backend.security

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
class DjangoAuthSession(@get:JsonProperty("_auth_user_id") val userId: String) {
    constructor() : this("")
}