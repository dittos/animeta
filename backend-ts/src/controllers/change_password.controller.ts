import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/services/auth.service";
import { ApiException } from "./exceptions";

type Params = {
  oldPassword: string;
  newPassword: string;
};

type Result = {
  ok: boolean;
};

@Controller('/api/v4/ChangePassword')
export class ChangePasswordController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User
  ): Promise<Result> {
    if (!await this.authService.checkPassword(currentUser, params.oldPassword))
      throw new ApiException('기존 암호를 확인해주세요.', HttpStatus.FORBIDDEN)
    await this.authService.changePassword(currentUser, params.newPassword)
    return {ok: true}
  }
}
