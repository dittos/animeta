package net.animeta.backend.service

import com.google.cloud.storage.Storage
import com.google.common.io.Resources
import net.animeta.backend.Application
import net.animeta.backend.TestDatabaseConfiguration
import net.animeta.backend.controller.admin.AdminController
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.service.admin.AnnMetadataCache
import org.assertj.core.api.Assertions.assertThat
import org.jsoup.parser.Parser
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [
    Application::class,
    TestDatabaseConfiguration::class
])
@MockBean(classes = [Storage::class])
class WorkServiceTest {
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var workRepository: WorkRepository

    @Autowired
    lateinit var workService: WorkService

    @Autowired
    lateinit var transactionTemplate: TransactionTemplate

    @Autowired
    lateinit var adminController: AdminController

    @MockBean
    lateinit var annMetadataCache: AnnMetadataCache

    @Test
    fun editMetadata_rawMetadataWithImportAnnShouldNotDuplicatePeriodIndex() {
        // https://github.com/dittos/animeta/issues/65
        val user = userRepository.save(User(
            username = "admin",
            date_joined = Timestamp.from(Instant.now()),
            staff = true
        ))
        val workId = transactionTemplate.execute { _ ->
            val work = workService.getOrCreate("hi")
            work.id
        }!!
        Mockito.`when`(annMetadataCache.getMetadata(Mockito.anyString()))
            .thenReturn(Parser.xmlParser().parseInput(Resources.toString(Resources.getResource("ann-metadata-sample.xml"), Charsets.UTF_8), "").selectFirst("anime"))
        adminController.editWork(user, workId, AdminController.EditWorkRequest(
            rawMetadata = "{\"version\": 2, \"periods\": [\"2018Q1\"]}",
            importAnnMetadata = "12345"
        ))
        transactionTemplate.execute {
            val work = workRepository.findById(workId).get()
            assertThat(work.periodIndexes.size).isEqualTo(1)
        }
    }
}