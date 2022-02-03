import { Controller, DefaultValuePipe, Get, Param, Query } from "@nestjs/common";
import { UserDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { UserSerializer, UserSerializerOptions } from "src/serializers/user.serializer";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiException } from "./exceptions";

@Controller('/api/v4/users/:name')
export class UserController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private userSerializer: UserSerializer,
  ) {}

  @Get()
  async get(
    @Param('name') name: string,
    @Query('options', new DefaultValuePipe('{}')) optionsJson: string,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: {username: name} })
    if (!user) throw ApiException.notFound()
    const options: UserSerializerOptions = JSON.parse(optionsJson)
    return this.userSerializer.serialize(user, currentUser, options)
  }
}
