package net.animeta.backend.repository

import net.animeta.backend.model.Person
import org.springframework.data.repository.CrudRepository

interface PersonRepository : CrudRepository<Person, Int> {
    fun findOneByAnnId(annId: Int): Person?
}