package net.animeta.backend.sql

import org.jetbrains.exposed.sql.Table

object Histories : Table("record_history") {
    val id = integer("id")
    val userId = integer("user_id")
    val workId = integer("work_id")
    val recordId = integer("record_id").references(Records.id)
    val status = varchar("status", 30)
    val statusType = integer("status_type")
    val comment = text("comment")
    val updatedAt = datetime("updated_at").nullable()
    val containsSpoiler = bool("contains_spoiler")
}