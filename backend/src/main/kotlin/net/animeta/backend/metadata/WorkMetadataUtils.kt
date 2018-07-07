package net.animeta.backend.metadata

import com.fasterxml.jackson.databind.JsonNode

fun readStringList(node: JsonNode): List<String> {
    if (node.isTextual) {
        return listOf(node.asText())
    } else {
        return node.map { it.asText() }
    }
}
