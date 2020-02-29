package net.animeta.backend.repository

import com.google.cloud.storage.Storage
import net.animeta.backend.Application
import net.animeta.backend.TestDatabaseConfiguration
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.service.RecordMutations
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [
    Application::class,
    TestDatabaseConfiguration::class
])
@MockBean(classes = [Storage::class])
class HistoryRepositoryTest {
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var historyRepository: HistoryRepository

    @Autowired
    lateinit var recordMutations: RecordMutations

    @Test
    fun countDistinctUsersByStatusType() {
        val user1 = newUser()
        val user2 = newUser()
        val title = UUID.randomUUID().toString()
        val episode = "1"
        val record1 = newRecord(user1, title, episode, StatusType.WATCHING)
        val record2 = newRecord(user2, title, episode, StatusType.SUSPENDED)
        val result = historyRepository.countDistinctUsersByStatusType(record1.workId, episode)
        Assertions.assertThat(result.toMap()).isEqualTo(mapOf(
            StatusType.WATCHING to 1L,
            StatusType.SUSPENDED to 1L
        ))
    }

    private fun newUser(): User {
        return userRepository.save(User(
            username = UUID.randomUUID().toString().take(10),
            date_joined = Timestamp.from(Instant.now())
        ))
    }

    private fun newRecord(user: User, title: String, status: String, statusType: StatusType): Record {
        return recordMutations.create(
            user = user,
            title = title,
            status = status,
            statusType = statusType,
            comment = "hi",
            containsSpoiler = false,
            rating = 5,
            category = null
        ).record
    }
}