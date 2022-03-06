import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/services/auth.service";
import { ApiException } from "./exceptions";
import { Result as AuthResult } from "./authenticate.controller";
import { QueryFailedError, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

type Params = {
  username: string;
  password1: string;
  password2: string;
};

type Result = {
  authResult: AuthResult;
};

@Controller('/api/v4/CreateAccount')
export class CreateAccountController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  @Post()
  async handle(@Body() params: Params): Promise<Result> {
    const existingUser = await this.userRepository.findOne({ where: {username: params.username} })
    if (existingUser)
      throw usernameAlreadyExistError()
    if (
      params.username === '' ||
      params.username.length > 30 ||
      !/^[A-Za-z0-9_]+$/.test(params.username) ||
      params.password1 === '' ||
      params.password2 === '' ||
      params.password1 !== params.password2
    ) {
      throw new ApiException("회원가입 실패", HttpStatus.BAD_REQUEST)
    }
    const user = new User()
    user.username = params.username
    user.first_name = ''
    user.last_name = ''
    user.email = ''
    user.is_staff = false
    user.is_active = true
    user.is_superuser = false
    user.last_login = new Date()
    user.date_joined = new Date()
    await this.authService.setPassword(user, params.password1)
    try {
      await this.userRepository.save(user)
    } catch (e) {
      // https://www.postgresql.org/docs/10/errcodes-appendix.html
      if (e instanceof QueryFailedError && e.driverError?.code === '23505') {
        throw usernameAlreadyExistError()
      } else {
        throw e
      }
    }
    const session = this.authService.createSession(user, false)
    return {
      authResult: {
        sessionKey: session.sessionKey,
        expiryMs: session.expiry?.total({unit: 'millisecond'}) ?? null,
      }
    }
  }
}

function usernameAlreadyExistError() {
  return new ApiException("이미 사용 중인 아이디입니다. 다른 아이디로 가입하세요.", HttpStatus.BAD_REQUEST)
}
