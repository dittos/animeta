package net.animeta.backend.repository

import net.animeta.backend.model.Company
import org.springframework.data.repository.CrudRepository

interface CompanyRepository : CrudRepository<Company, Int> {
    fun findOneByName(name: String): Company?

    fun findOneByAnnIds(annId: Int): Company?
}