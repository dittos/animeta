import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "src/services/auth.service";
import { ApiException } from "./exceptions";

type Params = {
  username: string;
  password: string;
  persistent: boolean;
};

type Result = {
  sessionKey: string;
  expiryMs: number | null;
};

@Controller('/api/v4/Authenticate')
export class AuthenticateController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() params: Params): Promise<Result> {
    const user = await this.authService.authenticate(params.username, params.password)
    if (!user || !user.is_active)
      throw new ApiException('없는 아이디거나 암호가 틀렸습니다.', HttpStatus.UNAUTHORIZED)
    const session = this.authService.createSession(user, params.persistent)
    return {
      sessionKey: session.sessionKey,
      expiryMs: session.expiry?.total({unit: 'millisecond'}) ?? null,
    }
  }
}
