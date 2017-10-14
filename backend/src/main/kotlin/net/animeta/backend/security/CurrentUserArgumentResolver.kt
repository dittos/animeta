package net.animeta.backend.security

import com.fasterxml.jackson.databind.ObjectMapper
import django.Signing
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.MethodParameter
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

@Component
class CurrentUserArgumentResolver(val userRepository: UserRepository,
                                  @Value("\${animeta.security.secret-key}") val secretKey: String) : HandlerMethodArgumentResolver {
    private val objectMapper = ObjectMapper().readerFor(DjangoAuthSession::class.java)

    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.hasParameterAnnotation(CurrentUser::class.java) &&
                User::class.java.isAssignableFrom(parameter.parameterType)
    }

    override fun resolveArgument(parameter: MethodParameter,
                                 mavContainer: ModelAndViewContainer,
                                 webRequest: NativeWebRequest,
                                 binderFactory: WebDataBinderFactory): User? {
        val header = webRequest.getHeader("x-animeta-session-key")
        if (header == null) {
            return null
        }
        val session: DjangoAuthSession = Signing.loadString(header, secretKey, "django.contrib.sessions.backends.signed_cookies", objectMapper::readValue, Int.MAX_VALUE)
        return userRepository.findOne(session.userId.toIntOrNull())
    }
}