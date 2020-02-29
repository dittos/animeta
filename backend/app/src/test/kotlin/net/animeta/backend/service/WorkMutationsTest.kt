package net.animeta.backend.service

import com.google.cloud.storage.Storage
import net.animeta.backend.Application
import net.animeta.backend.TestDatabaseConfiguration
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.repository.WorkRepository
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [
    Application::class,
    TestDatabaseConfiguration::class
])
@MockBean(classes = [Storage::class])
class WorkMutationsTest {
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var workRepository: WorkRepository

    @Autowired
    lateinit var recordRepository: RecordRepository

    @Autowired
    lateinit var workMutations: WorkMutations

    @Autowired
    lateinit var recordMutations: RecordMutations

    @Autowired
    lateinit var transactionTemplate: TransactionTemplate

    @Test
    fun merge() {
        val title1 = UUID.randomUUID().toString()
        val title2 = UUID.randomUUID().toString()

        val user1 = newUser()
        val user2 = newUser()
        val record1 = newRecord(user1, title1)
        val record2 = newRecord(user2, title2)

        val work = workRepository.findById(record1.workId).get()
        val other = workRepository.findById(record2.workId).get()

        transactionTemplate.execute {
            workMutations.merge(work, other, force = false)
        }

        Assertions.assertThat(workMutations.getOrCreate(title2).id).isEqualTo(work.id)

        Assertions.assertThat(recordRepository.findAllByUser(user1)[0].workId).isEqualTo(work.id)
        Assertions.assertThat(recordRepository.findAllByUser(user2)[0].workId).isEqualTo(work.id)
    }

    @Test
    fun mergeConflict() {
        val title1 = UUID.randomUUID().toString()
        val title2 = UUID.randomUUID().toString()
        val user1 = newUser()
        val user2 = newUser()
        val user3 = newUser()
        val record1 = newRecord(user1, title1)
        val record2 = newRecord(user1, title2)
        val record3 = newRecord(user2, title1)
        val record4 = newRecord(user3, title2)

        val work = workRepository.findById(record1.workId).get()
        val other = workRepository.findById(record2.workId).get()

        transactionTemplate.execute {
            Assertions.assertThatThrownBy {
                workMutations.merge(work, other, force = false)
            }.isEqualTo(ApiException(
                "Users with conflict exist",
                HttpStatus.UNPROCESSABLE_ENTITY,
                extra = WorkMutations.MergeError(
                    conflicts = listOf(WorkMutations.MergeConflictDTO(
                        user_id = user1.id!!,
                        username = user1.username,
                        ids = listOf(record1.id!!, record2.id!!)
                    ))
                )
            ))
        }

        transactionTemplate.execute {
            workMutations.merge(work, other, force = true)
        }

        Assertions.assertThat(workMutations.getOrCreate(title2).id).isEqualTo(work.id)

        Assertions.assertThat(recordRepository.findAllByUser(user1).single().workId).isEqualTo(work.id)
        Assertions.assertThat(recordRepository.findAllByUser(user2)[0].workId).isEqualTo(work.id)
        Assertions.assertThat(recordRepository.findAllByUser(user3)[0].workId).isEqualTo(work.id)
    }

    private fun newUser(): User {
        return userRepository.save(User(
            username = UUID.randomUUID().toString().take(10),
            date_joined = Timestamp.from(Instant.now())
        ))
    }

    private fun newRecord(user: User, title: String): Record {
        return recordMutations.create(
            user = user,
            title = title,
            status = "",
            statusType = StatusType.FINISHED,
            comment = "hi",
            containsSpoiler = false,
            rating = 5,
            category = null
        ).record
    }
}
