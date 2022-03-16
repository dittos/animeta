import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CategoryDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { CategorySerializer } from "src/serializers/category.serializer";
import { CategoryService } from "src/services/category.service";
import { Connection } from "typeorm";

type Params = {
  categoryIds: number[];
}

type Result = {
  categories: CategoryDTO[];
}

@Controller('/api/v4/UpdateCategoryOrder')
export class UpdateCategoryOrderController {
  constructor(
    private connection: Connection,
    private categoryService: CategoryService,
    private categorySerializer: CategorySerializer,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    return await this.connection.transaction(async em => {
      const categories = await this.categoryService.updateCategoryOrder(em, currentUser, params.categoryIds)
      return { categories: categories.map(it => this.categorySerializer.serialize(it)) }
    })
  }
}
