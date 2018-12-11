package net.animeta.backend.sql

import org.jetbrains.exposed.sql.Table

object WorkStaffs : Table("work_staff") {
    val id = integer("id")
    val workId = integer("work_id")
    val task = varchar("task", 50)
    val position = integer("position")
    val personId = integer("person_id")
    val metadata = text("metadata")
}