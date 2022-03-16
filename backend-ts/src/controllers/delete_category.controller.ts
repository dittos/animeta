import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CurrentUser } from "src/auth/decorators";
import { Category } from "src/entities/category.entity";
import { Record } from "src/entities/record.entity";
import { User } from "src/entities/user.entity";
import { EntityManager } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  id: number;
}

type Result = {
  ok: boolean;
}

@Controller('/api/v4/DeleteCategory')
export class DeleteCategoryController {
  constructor(
    @InjectEntityManager() private em: EntityManager,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const category = await this.em.findOne(Category, params.id)
    if (!category) return {ok: false}
    if (currentUser.id !== category.user_id)
      throw ApiException.permissionDenied()
    await this.em.update(Record, {category_id: category.id}, {category_id: null})
    await this.em.remove(category)
    return {ok: true}
  }
}
