package net.animeta.backend.serializer

import net.animeta.backend.model.Work
import org.springframework.stereotype.Service

@Service
class WorkSerializer {
    fun getImageUrl(work: Work): String? {
        if (work.image_filename != null)
            return "https://animeta.net/media/" + work.image_filename
        return null
    }
}