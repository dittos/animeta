package net.animeta.backend.dto

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.core.convert.TypeDescriptor
import org.springframework.core.convert.converter.GenericConverter

class JsonToObjectConverter(private val objectMapper: ObjectMapper, vararg classes: Class<*>) : GenericConverter {
    private val convertiblePairs = classes.map { GenericConverter.ConvertiblePair(String::class.java, it) }.toMutableSet()

    override fun getConvertibleTypes(): MutableSet<GenericConverter.ConvertiblePair> {
        return convertiblePairs
    }

    override fun convert(source: Any?, sourceType: TypeDescriptor, targetType: TypeDescriptor): Any {
        return objectMapper.readValue(source as String, targetType.type)
    }
}