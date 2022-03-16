import { Body, Controller, Post } from "@nestjs/common";
import { CategoryDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { CategorySerializer } from "src/serializers/category.serializer";
import { CategoryService } from "src/services/category.service";
import { Connection } from "typeorm";

type Params = {
  name: string;
}

type Result = {
  category: CategoryDTO;
}

@Controller('/api/v4/CreateCategory')
export class CreateCategoryController {
  constructor(
    private connection: Connection,
    private categoryService: CategoryService,
    private categorySerializer: CategorySerializer,
  ) {}

  @Post()
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    return await this.connection.transaction(async em => {
      const category = await this.categoryService.createCategory(em, currentUser, params)
      return { category: this.categorySerializer.serialize(category) }
    })
  }
}
