import { Injectable } from "@nestjs/common";
import { ApiException } from "src/controllers/exceptions";
import { Category } from "src/entities/category.entity";
import { User } from "src/entities/user.entity";
import { EntityManager } from "typeorm";
import { ValidationError } from "./exceptions";

@Injectable()
export class CategoryService {
  constructor(
  ) {
  }

  async createCategory(em: EntityManager, user: User, {
    name
  }: {
    name: string;
  }): Promise<Category> {
    name = name.trim()

    if (name === '')
      throw new ValidationError('분류 이름을 입력하세요.')
    
    const maxPosition = (await em.find(Category, {
      where: {user},
      order: {position: 'DESC'},
      take: 1,
    }))[0]?.position
    const nextPosition = maxPosition != null ? Number(maxPosition) + 1 : 0
    const category = new Category()
    category.user_id = user.id
    category.name = name
    category.position = nextPosition.toString()
    return em.save(category)
  }

  async updateCategoryOrder(em: EntityManager, user: User, categoryIds: number[]): Promise<Category[]> {
    const categories = await em.find(Category, {where: {user}})
    const categoryMap = new Map(categories.map(it => [it.id, it]))
    if (categoryIds.length !== categoryMap.size || categoryIds.some(it => !categoryMap.has(it))) {
      throw new ValidationError('분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.')
    }
    return await em.save(categoryIds.map((id, position) => {
      const category = categoryMap.get(id)!
      category.position = position.toString()
      return category
    }))
  }
}
