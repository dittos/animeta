package net.animeta.backend.security

annotation class CurrentUser(
    val required: Boolean = true,
    val staffRequired: Boolean = false
)