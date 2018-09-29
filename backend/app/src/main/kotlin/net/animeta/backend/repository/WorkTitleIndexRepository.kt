package net.animeta.backend.repository

import net.animeta.backend.model.WorkTitleIndex
import org.springframework.data.jpa.repository.JpaRepository

interface WorkTitleIndexRepository : JpaRepository<WorkTitleIndex, Int>
