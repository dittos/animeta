package net.animeta.backend.sql

import org.jetbrains.exposed.sql.Table

object Records : Table("record_record") {
    val id = integer("id")
    val userId = integer("user_id")
    val workId = integer("work_id")
    val status = varchar("status", 30)
    val updatedAt = datetime("updated_at").nullable()
    val statusType = integer("status_type")
    val title = varchar("title", 100)
}