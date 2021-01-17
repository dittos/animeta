package net.animeta.backend.controller.admin

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.Company
import net.animeta.backend.model.User
import net.animeta.backend.repository.CompanyRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.WorkService
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin/companies")
class AdminCompaniesController(
    private val companyRepository: CompanyRepository,
    private val workService: WorkService,
    private val objectMapper: ObjectMapper
) {
    @GetMapping
    fun getCompanies(): Iterable<Company> {
        // TODO: define DTO
        return companyRepository.findAll(Sort.by("name"))
    }

    data class CompanyDTO(
        val id: Int,
        val name: String,
        val works: List<CompanyWorkDTO>
    )
    data class CompanyWorkDTO(
        val id: Int,
        val title: String
    )

    @GetMapping("/{id}")
    fun getCompany(@PathVariable id: Int): CompanyDTO {
        return companyRepository.findById(id).orElse(null)?.let {
            CompanyDTO(
                id = it.id!!,
                name = it.name,
                works = it.works.map { CompanyWorkDTO(it.work.id!!, it.work.title) }
            )
        } ?: throw ApiException.notFound()
    }

    data class EditCompanyRequest(
        val name: String?,
        val mergeCompanyId: Int?
    )

    @PostMapping("/{id}")
    @Transactional
    fun editCompany(@CurrentUser(staffRequired = true) currentUser: User, @PathVariable id: Int, @RequestBody request: EditCompanyRequest): CompanyDTO {
        val company = companyRepository.findById(id).get()
        if (request.name != null && company.name != request.name) {
            if (companyRepository.findOneByName(request.name) != null) {
                throw Exception("Name collision")
            }
            val prevName = company.name
            company.name = request.name
            companyRepository.save(company)

            for (workCompany in company.works) {
                val work = workCompany.work
                val metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) } ?: WorkMetadata()
                workService.editMetadata(work, metadata.copy(
                    studios = metadata.studios?.map {
                        if (it == prevName) company.name else it
                    }
                ))
            }
        }
        if (request.mergeCompanyId != null) {
            mergeCompany(id, request.mergeCompanyId)
        }
        return getCompany(id)
    }

    private fun mergeCompany(companyId: Int, otherCompanyId: Int) {
        val company = companyRepository.findById(companyId).get()
        val other = companyRepository.findById(otherCompanyId).get()
        if (company.id == other.id) {
            throw ApiException("Cannot merge itself", HttpStatus.BAD_REQUEST)
        }
        if (other.works.any { it.company.id == company.id }) {
            throw ApiException("Works with conflict exists", HttpStatus.BAD_REQUEST)
        }
        for (workCompany in other.works) {
            val work = workCompany.work
            val metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) } ?: WorkMetadata()
            workService.editMetadata(work, metadata.copy(
                studios = metadata.studios?.map {
                    if (it == other.name) company.name else it
                }
            ))
        }
        companyRepository.delete(other)
    }
}
