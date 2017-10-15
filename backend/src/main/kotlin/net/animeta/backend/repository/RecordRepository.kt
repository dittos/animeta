package net.animeta.backend.repository

import net.animeta.backend.model.Record
import org.springframework.data.repository.CrudRepository

interface RecordRepository : CrudRepository<Record, Int>