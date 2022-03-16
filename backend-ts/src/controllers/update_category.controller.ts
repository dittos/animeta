import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CategoryDTO } from "shared/types_generated";
import { CurrentUser } from "src/auth/decorators";
import { Category } from "src/entities/category.entity";
import { User } from "src/entities/user.entity";
import { CategorySerializer } from "src/serializers/category.serializer";
import { EntityManager } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  id: number;
  name?: string | null;
}

type Result = {
  category: CategoryDTO;
}

@Controller('/api/v4/UpdateCategory')
export class UpdateCategoryController {
  constructor(
    @InjectEntityManager() private em: EntityManager,
    private categorySerializer: CategorySerializer,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const category = await this.em.findOne(Category, params.id)
    if (!category)
      throw ApiException.notFound()
    if (currentUser.id !== category.user_id)
      throw ApiException.permissionDenied()
    if (params.name != null) {
      if (params.name.trim() === '')
        throw new ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
      category.name = params.name
    }
    await this.em.save(category)
    return {category: this.categorySerializer.serialize(category)}
  }
}
