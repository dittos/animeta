import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { TwitterService } from "src/services/twitter.service";

type Params = {
}

type Result = {
  ok: boolean;
}

@Controller('/api/v4/DisconnectTwitter')
export class DisconnectTwitterController {
  constructor(
    private twitterService: TwitterService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    await this.twitterService.removeOAuthAuthorization(currentUser)
    return {ok: true}
  }
}
