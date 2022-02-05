import { Controller, DefaultValuePipe, Get, Query } from "@nestjs/common";
import { UserDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { UserSerializer, UserSerializerOptions } from "src/serializers/user.serializer";
import { ApiException } from "./exceptions";

@Controller('/api/v4/me')
export class CurrentUserController {
  constructor(
    private userSerializer: UserSerializer,
  ) {}

  @Get()
  async get(
    @Query('options', new DefaultValuePipe('{}')) optionsJson: string,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<UserDTO> {
    if (!currentUser) throw new ApiException('Not logged in', 403)
    const options: UserSerializerOptions = JSON.parse(optionsJson)
    return this.userSerializer.serialize(currentUser, currentUser, options)
  }
}
