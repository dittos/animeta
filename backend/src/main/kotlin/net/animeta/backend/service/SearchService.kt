package net.animeta.backend.service

import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.model.QWorkIndex.workIndex
import net.animeta.backend.model.QWorkTitleIndex.workTitleIndex
import net.animeta.backend.model.WorkIndex
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

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
class SearchService(private val entityManager: EntityManager) {
    fun searchWorks(query: String, limit: Int, minRecordCount: Int = 2): List<WorkIndex> {
        val regex = makeRegex(query)
        return JPAQuery<WorkIndex>(entityManager, HQLTemplates.DEFAULT)
                .select(workIndex).distinct()
                .from(workIndex, workTitleIndex)
                .where(workTitleIndex.work_id.eq(workIndex.work_id))
                .where(workTitleIndex.key.matches(regex))
                .where(workIndex.record_count.goe(minRecordCount)
                        .and(workIndex.blacklisted.isFalse))
                .orderBy(workIndex.rank.asc())
                .limit(limit.toLong())
                .fetch()
    }

    fun suggestWorks(query: String, limit: Int): List<WorkIndex> {
        val key = makeKey(query)
        return JPAQuery<WorkIndex>(entityManager, HQLTemplates.DEFAULT)
                .select(workIndex).distinct()
                .from(workIndex, workTitleIndex)
                .where(workTitleIndex.work_id.eq(workIndex.work_id))
                .where(workTitleIndex.key.startsWith(key))
                .where(workIndex.record_count.gt(1)
                        .and(workIndex.blacklisted.isFalse))
                .orderBy(workIndex.rank.asc())
                .limit(limit.toLong())
                .fetch()
    }

    private fun makeRegex(query: String): String {
        return makeKeySequence(query)
                // We don't need to escape the key. Special characters are removed already.
                .joinToString(".*", prefix = ".*", postfix = ".*")
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