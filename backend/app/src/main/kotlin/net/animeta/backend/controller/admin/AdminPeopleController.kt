package net.animeta.backend.controller.admin

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import net.animeta.backend.model.Person
import net.animeta.backend.model.User
import net.animeta.backend.repository.PersonRepository
import net.animeta.backend.repository.WorkCastRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.security.CurrentUser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin/people")
class AdminPeopleController(
    private val personRepository: PersonRepository,
    private val workStaffRepository: WorkStaffRepository,
    private val workCastRepository: WorkCastRepository,
    private val objectMapper: ObjectMapper
) {
    data class PersonWorkDTO(val workId: Int, val workTitle: String, val roleOrTask: String)
    data class PersonDTO(val id: Int,
                         val name: String,
                         val staffs: List<PersonWorkDTO>,
                         val casts: List<PersonWorkDTO>,
                         val metadata: JsonNode?)

    @GetMapping
    fun listPerson(@CurrentUser(staffRequired = true) currentUser: User,
                   @RequestParam(defaultValue = "1") page: Int): List<PersonDTO> {
        val pageable = PageRequest.of(page, 128, Sort.by(Sort.Direction.DESC, "id"))
        val people = personRepository.findAll(pageable)
        return people.content.map { serialize(it) }
    }

    @GetMapping("/{id}")
    fun getPerson(@CurrentUser(staffRequired = true) currentUser: User, @PathVariable id: Int): PersonDTO {
        val person = personRepository.findById(id).get()
        return serialize(person)
    }

    data class EditPersonRequest(val name: String?)

    @PostMapping("/{id}")
    fun editPerson(@CurrentUser(staffRequired = true) currentUser: User, @PathVariable id: Int, @RequestBody request: EditPersonRequest): PersonDTO {
        val person = personRepository.findById(id).get()
        if (request.name != null) {
            person.name = request.name
        }
        personRepository.save(person)
        return serialize(person)
    }

    private fun serialize(person: Person): PersonDTO {
        return PersonDTO(
            id = person.id!!,
            name = person.name,
            staffs = workStaffRepository.findByPerson(person).map {
                PersonWorkDTO(it.work.id!!, it.work.title, it.task)
            },
            casts = workCastRepository.findByActor(person).map {
                PersonWorkDTO(it.work.id!!, it.work.title, it.role)
            },
            metadata = person.metadata?.let(objectMapper::readTree)
        )
    }
}
