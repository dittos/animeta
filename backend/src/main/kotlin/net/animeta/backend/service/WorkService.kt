package net.animeta.backend.service

import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkRepository
import org.springframework.stereotype.Service

@Service
class WorkService(val workRepository: WorkRepository,
                  val titleMappingRepository: TitleMappingRepository) {
    fun getOrCreate(title: String): Work {
        val key = normalizeTitle(title)
        val mapping = titleMappingRepository.findOneByTitle(key)
        if (mapping != null) {
            return mapping.work
        }
        val similarMapping = titleMappingRepository.findOneByKey(key)
        if (similarMapping != null) {
            val mapping = titleMappingRepository.save(TitleMapping(
                    work = similarMapping.work,
                    title = title,
                    key = key
            ))
            return mapping.work
        } else {
            val work = workRepository.save(Work(
                    title = title,
                    image_filename = null,
                    metadata = null,
                    blacklisted = false
            ))
            titleMappingRepository.save(TitleMapping(
                    work = work,
                    title = title,
                    key = key
            ))
            return work
        }
    }

    companion object {
        private val exceptionChars = "!+"

        fun normalizeTitle(title: String): String {
            return title
                    .map {
                        // full width -> half width
                        if (it in '\uFF01'..'\uFF5E') {
                            it.minus(0xFF01).plus(0x21)
                        } else {
                            it
                        }
                    }
                    .filter { exceptionChars.contains(it) || "LN".contains(it.category.code[0]) }
                    .joinToString("")
                    .toLowerCase()
                    .trim()
        }
    }
}