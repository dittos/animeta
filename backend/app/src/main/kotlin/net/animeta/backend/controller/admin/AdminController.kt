package net.animeta.backend.controller.admin

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.controller.v2.TablePeriodController
import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.Company
import net.animeta.backend.model.Person
import net.animeta.backend.model.QWork.work
import net.animeta.backend.model.User
import net.animeta.backend.repository.CompanyRepository
import net.animeta.backend.repository.PersonRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkCastRepository
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import net.animeta.backend.service.ChartService
import net.animeta.backend.service.CompanyMutations
import net.animeta.backend.service.WorkMutations
import net.animeta.backend.service.WorkService
import net.animeta.backend.service.admin.AnnMetadataCache
import net.animeta.backend.service.admin.AnnService
import net.animeta.backend.service.admin.ImageService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.io.File
import java.util.UUID

@RestController
@RequestMapping("/admin")
class AdminController(
    private val datastore: Datastore,
    private val workService: WorkService,
    private val workMutations: WorkMutations,
    private val imageService: ImageService,
    private val workRepository: WorkRepository,
    private val workIndexRepository: WorkIndexRepository,
    private val recordRepository: RecordRepository,
    private val titleMappingRepository: TitleMappingRepository,
    private val chartService: ChartService,
    private val workStaffRepository: WorkStaffRepository,
    private val workCastRepository: WorkCastRepository,
    private val personRepository: PersonRepository,
    private val companyRepository: CompanyRepository,
    private val companyMutations: CompanyMutations,
    private val workSerializer: WorkSerializer,
    private val tablePeriodController: TablePeriodController,
    private val annService: AnnService,
    private val annMetadataCache: AnnMetadataCache,
    private val objectMapper: ObjectMapper
) {
    @GetMapping("/works")
    fun getWorks(@CurrentUser currentUser: User,
                 @RequestParam("orphans", defaultValue = "false") onlyOrphans: Boolean,
                 @RequestParam(defaultValue = "0") offset: Int): List<WorkDTO> {
        checkPermission(currentUser)

        var query = work.query.filter(work.blacklisted.isFalse)
//        if (onlyOrphans) {
//            query = query.filter(work.indexes.any().record_count.eq(0))
//        }
        query = query.orderBy(work.id.desc()).offset(offset).limit(50)
        return datastore.query(query).map { workSerializer.serialize(it) }
    }

    data class CreateWorkRequest(val title: String)

    @PostMapping("/works")
    fun createWork(@CurrentUser currentUser: User,
                   @RequestBody request: CreateWorkRequest): WorkDTO {
        checkPermission(currentUser)
        val work = workMutations.getOrCreate(request.title)
        return workSerializer.serialize(work)
    }

    data class TitleMappingDTO(val id: Int, val title: String, val record_count: Int)
    data class AdminWorkIndexDTO(val record_count: Int, val rank: Int)
    data class AdminWorkDTO(
            val id: Int,
            val title: String,
            val image_filename: String?,
            val image_path: String?,
            val image_center_y: Double,
            val raw_metadata: String,
            val metadata: WorkMetadata?,
            val title_mappings: List<TitleMappingDTO>,
            val index: AdminWorkIndexDTO?,
            val staffs: List<WorkStaffDTO>,
            val casts: List<WorkCastDTO>
    )
    data class WorkStaffDTO(
        val task: String,
        val name: String,
        val personId: Int,
        var metadata: JsonNode?
    )
    data class WorkCastDTO(
        val role: String,
        val name: String,
        val personId: Int,
        var metadata: JsonNode?
    )

    @GetMapping("/works/{id}")
    fun getWork(@CurrentUser currentUser: User,
                @PathVariable id: Int): AdminWorkDTO {
        checkPermission(currentUser)
        val work = workRepository.findById(id).orElse(null)
        val titleMappings = work.titleMappings.map {
            TitleMappingDTO(
                    id = it.id!!,
                    title = it.title,
                    record_count = recordRepository.countByTitle(it.title)
            )
        }.sortedByDescending { it.record_count }
        val index = workIndexRepository.findOneByWorkId(work.id!!)
        return AdminWorkDTO(
                id = work.id!!,
                title = work.title,
                image_filename = work.image_filename,
                image_path = workSerializer.getImageUrl(work),
                image_center_y = work.image_center_y,
                raw_metadata = work.raw_metadata ?: "",
                metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) },
                title_mappings = titleMappings,
                index = index?.let { AdminWorkIndexDTO(record_count = it.record_count, rank = it.rank) },
                staffs = work.staffs.map {
                    WorkStaffDTO(it.task, it.person.name, it.person.id!!, it.metadata?.let(objectMapper::readTree))
                },
                casts = work.casts.map {
                    WorkCastDTO(it.role, it.actor.name, it.actor.id!!, it.metadata?.let(objectMapper::readTree))
                }
        )
    }

    data class CrawlImageOptions(val source: String, val annId: String?, val url: String?)
    data class EditWorkRequest(val primaryTitleMappingId: Int? = null,
                               val mergeWorkId: Int? = null,
                               val forceMerge: Boolean? = null,
                               val rawMetadata: String? = null,
                               val crawlImage: CrawlImageOptions? = null,
                               val blacklisted: Boolean? = null,
                               val imageCenterY: Double? = null,
                               val importAnnMetadata: String? = null)

    @PostMapping("/works/{id}")
    @Transactional
    fun editWork(@CurrentUser currentUser: User,
                 @PathVariable id: Int,
                 @RequestBody request: EditWorkRequest): AdminWorkDTO {
        checkPermission(currentUser)
        if (request.primaryTitleMappingId != null) {
            val work = workRepository.findById(id).get()
            workMutations.updatePrimaryTitleMapping(work, request.primaryTitleMappingId)
        }
        if (request.mergeWorkId != null) {
            val work = workRepository.findById(id).get()
            val other = workRepository.findById(request.mergeWorkId).get()
            workMutations.merge(work, other, force = request.forceMerge ?: false)
        }
        if (request.rawMetadata != null) {
            val work = workRepository.findById(id).orElse(null)
            workMutations.updateMetadata(work, workService.parseMetadata(request.rawMetadata))
        }
        if (request.crawlImage != null) {
            crawlImage(id, request.crawlImage)
        }
        if (request.blacklisted != null) {
            val work = workRepository.findById(id).orElse(null)
            workMutations.blacklist(work)
        }
        if (request.imageCenterY != null) {
            val work = workRepository.findById(id).orElse(null)
            workMutations.updateImageCenter(work, request.imageCenterY)
        }
        if (request.importAnnMetadata != null) {
            val work = workRepository.findById(id).orElse(null)
            annService.importMetadata(work, annMetadataCache.getMetadata(request.importAnnMetadata))
            workRepository.save(work) // FIXME
        }
        return getWork(currentUser, id)
    }

    private fun crawlImage(id: Int, options: CrawlImageOptions) {
        val work = workRepository.findById(id).orElse(null)
        val tempFile = File.createTempFile("orig", ".tmp")
        val tempThumbFile = File.createTempFile("thumb", ".jpg")
        try {
            when (options.source) {
                "ann" -> {
                    imageService.downloadAnnPoster(options.annId!!, tempFile)
                    imageService.generateThumbnail(tempFile, tempThumbFile)
                    val originalFilename = "ann${options.annId}.jpg"
                    val filename = "thumb/v2/${originalFilename}"
                    imageService.upload(tempFile, originalFilename)
                    imageService.upload(tempThumbFile, filename)
                    workMutations.updateImageFilename(work, filename, originalFilename)
                }
                "url" -> {
                    imageService.download(options.url!!, tempFile)
                    imageService.generateThumbnail(tempFile, tempThumbFile)
                    val originalFilename = UUID.randomUUID().toString()
                    val filename = "thumb/${work.original_image_filename}"
                    imageService.upload(tempFile, originalFilename)
                    imageService.upload(tempThumbFile, filename)
                    workMutations.updateImageFilename(work, filename, originalFilename)
                }
            }
        } finally {
            tempFile.delete()
            tempThumbFile.delete()
        }
    }

    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping("/works/{id}")
    @Transactional
    fun deleteWork(@CurrentUser currentUser: User,
                   @PathVariable id: Int): DeleteResponse {
        checkPermission(currentUser)
        val work = workRepository.findById(id).orElse(null)
        workMutations.delete(work)
        return DeleteResponse(true)
    }

    data class AddTitleMappingRequest(val title: String)

    @PostMapping("/works/{id}/title-mappings")
    @Transactional
    fun addTitleMapping(@CurrentUser currentUser: User,
                        @PathVariable id: Int,
                        @RequestBody request: AddTitleMappingRequest): TitleMappingDTO {
        checkPermission(currentUser)
        val work = workRepository.findById(id).orElse(null)
        val title = request.title.trim()
        val mapping = workMutations.addTitleMapping(work, title)
        return TitleMappingDTO(id = mapping.id!!, title = title, record_count = 0)
    }

    @DeleteMapping("/title-mappings/{id}")
    fun deleteTitleMapping(@CurrentUser currentUser: User, @PathVariable id: Int): DeleteResponse {
        checkPermission(currentUser)
        val titleMapping = titleMappingRepository.findById(id).orElse(null)
        workMutations.deleteTitleMapping(titleMapping)
        return DeleteResponse(true)
    }

    @DeleteMapping("/caches")
    fun clearCache(@CurrentUser currentUser: User): DeleteResponse {
        checkPermission(currentUser)
        chartService.invalidateWorkCache()
        tablePeriodController.invalidateCache()
        return DeleteResponse(true)
    }

    data class PersonWorkDTO(val workId: Int, val workTitle: String, val roleOrTask: String)
    data class PersonDTO(val id: Int,
                         val name: String,
                         val staffs: List<PersonWorkDTO>,
                         val casts: List<PersonWorkDTO>,
                         val metadata: JsonNode?)

    @GetMapping("/people")
    fun listPerson(@CurrentUser currentUser: User,
                   @RequestParam(defaultValue = "1") page: Int): List<PersonDTO> {
        checkPermission(currentUser)
        val pageable = PageRequest.of(page, 128, Sort.by(Sort.Direction.DESC, "id"))
        val people = personRepository.findAll(pageable)
        return people.content.map { serialize(it) }
    }

    @GetMapping("/people/{id}")
    fun getPerson(@CurrentUser currentUser: User, @PathVariable id: Int): PersonDTO {
        checkPermission(currentUser)
        val person = personRepository.findById(id).get()
        return serialize(person)
    }

    data class EditPersonRequest(val name: String?)

    @PostMapping("/people/{id}")
    fun editPerson(@CurrentUser currentUser: User, @PathVariable id: Int, @RequestBody request: EditPersonRequest): PersonDTO {
        checkPermission(currentUser)
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

    @GetMapping("/companies")
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

    @GetMapping("/companies/{id}")
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

    @PostMapping("/companies/{id}")
    @Transactional
    fun editCompany(@CurrentUser currentUser: User, @PathVariable id: Int, @RequestBody request: EditCompanyRequest): CompanyDTO {
        checkPermission(currentUser)
        val company = companyRepository.findById(id).get()
        if (request.name != null) {
            companyMutations.updateName(company, request.name)
        }
        if (request.mergeCompanyId != null) {
            val other = companyRepository.findById(request.mergeCompanyId).get()
            companyMutations.merge(company, other)
        }
        return getCompany(id)
    }

    private fun checkPermission(user: User) {
        if (!user.staff) {
            throw ApiException("Staff permission required.", HttpStatus.UNAUTHORIZED)
        }
    }
}
