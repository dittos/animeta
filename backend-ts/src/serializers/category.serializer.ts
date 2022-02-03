import { Injectable } from "@nestjs/common";
import { CategoryDTO } from "shared/types_generated";
import { Category } from "src/entities/category.entity";

@Injectable()
export class CategorySerializer {
  serialize(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name,
    };
  }
}