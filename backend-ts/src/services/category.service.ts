import { Injectable } from "@nestjs/common";
import { Category } from "src/entities/category.entity";
import { User } from "src/entities/user.entity";
import { EntityManager } from "typeorm";
import { ValidationError } from "./exceptions";
import { db, runWithDb } from "src2/database";
import { Record } from "src/entities/record.entity";

@Injectable()
export class CategoryService {
  constructor(
  ) {
  }

  async createCategory(em: EntityManager, user: User, params: {
    name: string;
  }): Promise<Category> {
    return createCategory(em, user, params)
  }

  async updateCategoryOrder(em: EntityManager, user: User, categoryIds: number[]): Promise<Category[]> {
    return runWithDb(em, () => updateCategoryOrder(user, categoryIds))
  }
}

export async function createCategory(em: EntityManager, user: User, {
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

export async function renameCategory(category: Category, name: string) {
  if (name != null) {
    if (name.trim() === '')
      throw new ValidationError("분류 이름을 입력하세요.")
    category.name = name
  }
  await db.save(category)
}

export async function updateCategoryOrder(user: User, categoryIds: number[]) {
  const categories = await db.find(Category, {where: {user}})
  const categoryMap = new Map(categories.map(it => [it.id, it]))
  if (categoryIds.length !== categoryMap.size || categoryIds.some(it => !categoryMap.has(it))) {
    throw new ValidationError('분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.')
  }
  return await db.save(categoryIds.map((id, position) => {
    const category = categoryMap.get(id)!
    category.position = position.toString()
    return category
  }))
}

export async function deleteCategory(category: Category) {
  await db.update(Record, {category_id: category.id}, {category_id: null})
  await db.remove(category)
}
