package net.animeta.backend.repository

import net.animeta.backend.model.Work
import org.springframework.data.repository.CrudRepository

interface WorkRepository : CrudRepository<Work, Int> {
}