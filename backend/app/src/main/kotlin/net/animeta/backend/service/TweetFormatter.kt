package net.animeta.backend.service

import net.animeta.backend.model.History
import net.animeta.backend.model.StatusType

object TweetFormatter {
    fun format(history: History): String {
        val title = history.record.title
        val status = formatStatusText(history)
        val url = "https://animeta.net/-${history.id}"
        val comment = if (history.contains_spoiler) {
            "[${String(intArrayOf(0x1F507), 0, 1)} 내용 누설 가림]"
        } else {
            history.comment
        }
        return buildString {
            append("$title $status")
            if (comment.isNotEmpty()) {
                append(": $comment")
            }
            val limit = 140 - (url.length + 1)
            if (length > limit) {
                setLength(limit - 1)
                append("\u2026")
            }
            append(" $url")
        }
    }

    private fun formatStatusText(history: History): String {
        var status = history.status.trim()
        if (status.isNotEmpty() && status.last().isDigit()) {
            status += "화"
        }
        if (history.status_type != StatusType.WATCHING || status == "") {
            val statusTypeText = when (history.status_type) {
                StatusType.FINISHED -> "완료"
                StatusType.WATCHING -> "보는 중"
                StatusType.SUSPENDED -> "중단"
                StatusType.INTERESTED -> "볼 예정"
            }
            if (status != "") {
                status += " ($statusTypeText)"
            } else {
                status = statusTypeText
            }
        }
        return status
    }
}
