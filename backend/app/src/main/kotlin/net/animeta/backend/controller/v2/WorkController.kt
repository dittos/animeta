package net.animeta.backend.controller.v2

import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.WorkCastRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}")
class WorkController(
    val workRepository: WorkRepository,
    val workSerializer: WorkSerializer,
    val workCastRepository: WorkCastRepository,
    val workStaffRepository: WorkStaffRepository
) {
    @GetMapping
    fun get(@PathVariable id: Int, @CurrentUser(required = false) currentUser: User?): WorkDTO {
        val work = workRepository.findById(id).orElseThrow { ApiException.notFound() }
        return workSerializer.serialize(work, currentUser, full = true)
    }

    data class GetPeopleResponse(
        val staffs: List<WorkStaffDTO>,
        val casts: List<WorkCastDTO>
    )
    data class WorkStaffDTO(
        val task: String,
        val name: String,
        val personId: Int,
        val otherWorks: List<OtherWorkStaffDTO>?
    )
    data class OtherWorkStaffDTO(
        val task: String,
        val workId: Int,
        val workTitle: String
    )
    data class WorkCastDTO(
        val role: String,
        val name: String,
        val personId: Int,
        val otherWorks: List<OtherWorkCastDTO>?
    )
    data class OtherWorkCastDTO(
        val role: String,
        val workId: Int,
        val workTitle: String
    )

    @GetMapping("/people")
    fun getPeople(@PathVariable id: Int, @CurrentUser(required = false) currentUser: User?): GetPeopleResponse {
        val work = workRepository.findById(id).orElseThrow { ApiException.notFound() }
        val user = currentUser
        val userWorks = if (user != null) {
            user.records.filter { it.status_type == StatusType.WATCHING || it.status_type == StatusType.FINISHED }
                .map { it.work }
                .filter { it !== work }
        } else {
            emptyList()
        }
        val userRecordsByWork = if (user != null) {
            user.records.associateBy { it.work.id!! }
        } else {
            emptyMap()
        }
        val relatedWorkStaffs = workStaffRepository.findByPersonInAndWorkIn(
            work.staffs.map { it.person }, userWorks
        ).groupBy { it.person.id!! }
        val relatedWorkCasts = workCastRepository.findByActorInAndWorkIn(
            work.casts.map { it.actor }, userWorks
        ).groupBy { it.actor.id!! }
        return GetPeopleResponse(
            staffs = work.staffs.map {
                WorkStaffDTO(it.task, it.person.name, it.person.id!!, relatedWorkStaffs[it.person.id!!]?.map {
                    OtherWorkStaffDTO(it.task, it.work.id!!, userRecordsByWork[it.work.id!!]!!.title)
                })
            },
            casts = work.casts.map {
                WorkCastDTO(it.role, it.actor.name, it.actor.id!!, relatedWorkCasts[it.actor.id!!]?.map {
                    OtherWorkCastDTO(it.role, it.work.id!!, userRecordsByWork[it.work.id!!]!!.title)
                }) }
        )
    }
}
