package net.animeta.backend.repository

import net.animeta.backend.model.Company
import org.springframework.data.jpa.repository.JpaRepository

interface CompanyRepository : JpaRepository<Company, Int> {
    fun findOneByName(name: String): Company?

    fun findOneByAnnIds(annId: Int): Company?
}