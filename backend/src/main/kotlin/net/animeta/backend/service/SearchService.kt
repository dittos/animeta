package net.animeta.backend.service

import net.animeta.backend.model.WorkIndex
import net.animeta.backend.repository.WorkIndexRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service

val firsts = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
val middles = listOf(
    "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅗㅏ",
    "ㅗㅐ", "ㅗㅣ", "ㅛ", "ㅜ", "ㅜㅓ", "ㅜㅔ", "ㅜㅣ", "ㅠ", "ㅡ",
    "ㅡㅣ", "ㅣ"
)
val lasts = listOf(
    "", "ㄱ", "ㄲ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ", "ㄹ",
    "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ", "ㅁ",
    "ㅂ", "ㅂㅅ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
)

@Service
class SearchService(private val workIndexRepository: WorkIndexRepository) {
    fun searchWorks(query: String, limit: Int, minRecordCount: Int = 2): List<WorkIndex> {
        val pattern = makePattern(query)
        return workIndexRepository.search(pattern, minRecordCount, PageRequest.of(0, limit))
    }

    fun suggestWorks(query: String, limit: Int): List<WorkIndex> {
        val key = makeKey(query)
        return workIndexRepository.search("$key%", 2, PageRequest.of(0, limit))
    }

    private fun makePattern(query: String): String {
        return makeKeySequence(query)
                // We don't need to escape the key. Special characters are removed already.
                .joinToString("%", prefix = "%", postfix = "%")
    }

    private fun makeKey(query: String): String {
        return makeKeySequence(query).joinToString("")
    }

    private fun makeKeySequence(query: String): Sequence<String> {
        return query.asSequence()
                .mapNotNull {
                    when {
                        it in '가'..'힣' -> {
                            val offset = it - '가'
                            val first = firsts[offset / (middles.size * lasts.size)]
                            val middle = middles[(offset / lasts.size) % middles.size]
                            val last = lasts[offset % lasts.size]
                            first + middle + last
                        }
                        it.isLetterOrDigit() -> it.toLowerCase().toString()
                        else -> null
                    }
                }
    }
}
