import { Category } from "src/entities/category.entity";
import { CategoryDto } from "src/schemas/category";

export function serializeCategory(category: Category): CategoryDto {
  return {
    id: category.id.toString(),
    name: category.name,
  };
}