import { CACHE_MANAGER, Controller, Delete, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";

@Controller('/api/admin/v0/caches')
export class AdminCachesController {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
  }

  @Delete()
  async clear(@CurrentUser({ staffRequired: true }) currentUser: User): Promise<{ok: boolean}> {
    await this.cache.reset()
    return {ok: true}
  }
}
