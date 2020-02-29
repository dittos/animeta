package net.animeta.backend.service

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Company
import net.animeta.backend.repository.CompanyRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class CompanyMutations(
    private val companyRepository: CompanyRepository
) {
    @Autowired
    private lateinit var workMutations: WorkMutations

    fun getOrCreate(name: String): Company {
        return companyRepository.findOneByName(name) ?: companyRepository.save(Company(
            name = name,
            metadata = null,
            annId = null
        ))
    }

    fun getOrCreate(name: String, annId: Int): Company {
        val existing = companyRepository.findOneByAnnIds(annId) ?:
            companyRepository.findOneByName(name)
        // TODO: merge annId when existing was found by name?
        return existing ?: companyRepository.save(Company(
            name = name,
            metadata = null,
            annId = annId,
            annIds = setOf(annId)
        ))
    }

    fun updateName(company: Company, name: String) {
        if (company.name == name) {
            return
        }
        if (companyRepository.findOneByName(name) != null) {
            throw Exception("Name collision")
        }
        val prevName = company.name
        company.name = name
        companyRepository.save(company)

        workMutations.didUpdateCompanyName(company, prevName)
    }

    fun merge(company: Company, other: Company) {
        if (company.id == other.id) {
            throw ApiException("Cannot merge itself", HttpStatus.BAD_REQUEST)
        }
        workMutations.willMergeCompany(company, other)
        companyRepository.delete(other)
        workMutations.didMergeCompany(company, other)
    }
}
