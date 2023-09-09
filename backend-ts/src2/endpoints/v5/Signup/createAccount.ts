import { User } from "src/entities/user.entity";
import { ApiException } from "src2/exceptions";
import { AuthResult } from "../LoginForm/authenticate";
import { QueryFailedError } from "typeorm";
import { db } from "src2/database";
import { createSession, setPassword } from "src2/services/auth";

export default async function (params: {
  username: string;
  password1: string;
  password2: string;
}): Promise<{
  authResult: AuthResult;
}> {
  const existingUser = await db.findOne(User, { where: {username: params.username} })
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
    throw new ApiException("회원가입 실패", 400)
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
  await setPassword(user, params.password1)
  try {
    await db.save(user)
  } catch (e) {
    // https://www.postgresql.org/docs/10/errcodes-appendix.html
    if (e instanceof QueryFailedError && e.driverError?.code === '23505') {
      throw usernameAlreadyExistError()
    } else {
      throw e
    }
  }
  const session = createSession(user, false)
  return {
    authResult: {
      sessionKey: session.sessionKey,
      expiryMs: session.expiry?.total({unit: 'millisecond'}) ?? null,
    }
  }
}

function usernameAlreadyExistError() {
  return new ApiException("이미 사용 중인 아이디입니다. 다른 아이디로 가입하세요.", 400)
}
