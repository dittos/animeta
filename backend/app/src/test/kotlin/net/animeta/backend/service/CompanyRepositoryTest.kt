package net.animeta.backend.service

import com.google.cloud.storage.Storage
import net.animeta.backend.Application
import net.animeta.backend.TestDatabaseConfiguration
import net.animeta.backend.model.Company
import net.animeta.backend.repository.CompanyRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [
    Application::class,
    TestDatabaseConfiguration::class
])
@MockBean(classes = [Storage::class])
class CompanyRepositoryTest {
    @Autowired
    lateinit var companyRepository: CompanyRepository

    @Test
    fun findOneByAnnIds() {
        val company = companyRepository.save(Company(
            name = "A",
            metadata = null,
            annId = 1,
            annIds = setOf(1, 2, 3)
        ))
        for (annId in company.annIds) {
            assertThat(companyRepository.findOneByAnnIds(annId)?.id)
                .isEqualTo(company.id)
        }
    }
}