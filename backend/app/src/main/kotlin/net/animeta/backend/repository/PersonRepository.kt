package net.animeta.backend.repository

import net.animeta.backend.model.Person
import org.springframework.data.repository.PagingAndSortingRepository

interface PersonRepository : PagingAndSortingRepository<Person, Int> {
    fun findOneByAnnId(annId: Int): Person?
}