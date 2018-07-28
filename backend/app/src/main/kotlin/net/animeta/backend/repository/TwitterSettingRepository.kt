package net.animeta.backend.repository

import net.animeta.backend.model.TwitterSetting
import org.springframework.data.repository.CrudRepository

interface TwitterSettingRepository : CrudRepository<TwitterSetting, Int>