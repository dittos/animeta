package net.animeta.backend.db

import org.hibernate.engine.spi.SessionImplementor
import org.hibernate.usertype.UserType
import org.postgresql.util.PGobject
import org.springframework.util.ObjectUtils
import java.io.Serializable
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.Types

class JSONBUserType : UserType {
    override fun deepCopy(value: Any?): Any? {
        if (value is String) {
            return value
        }
        return null
    }

    override fun replace(original: Any?, target: Any?, owner: Any?): Any? {
        return original
    }

    override fun returnedClass(): Class<*> {
        return String::class.java
    }

    override fun assemble(cached: Serializable?, owner: Any?): Any? {
        return cached
    }

    override fun disassemble(value: Any?): Serializable? {
        return value as? Serializable
    }

    override fun nullSafeSet(st: PreparedStatement, value: Any?, index: Int, session: SessionImplementor?) {
        if (value == null) {
            st.setNull(index, Types.OTHER)
        } else {
            st.setObject(index, value, Types.OTHER)
        }
    }

    override fun nullSafeGet(rs: ResultSet, names: Array<out String>, session: SessionImplementor?, owner: Any?): Any? {
        val pgo = rs.getObject(names[0]) as? PGobject
        return pgo?.value
    }

    override fun isMutable(): Boolean {
        return false
    }

    override fun sqlTypes(): IntArray {
        return intArrayOf(Types.JAVA_OBJECT)
    }

    override fun hashCode(x: Any?): Int {
        return x?.hashCode() ?: 0
    }

    override fun equals(x: Any?, y: Any?): Boolean {
        return ObjectUtils.nullSafeEquals(x, y)
    }
}