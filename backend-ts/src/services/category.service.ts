import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "src/entities/category.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { ValidationError } from "./exceptions";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {
  }

  async createCategory(user: User, {
    name
  }: {
    name: string;
  }): Promise<Category> {
    name = name.trim()

    if (name === '')
      throw new ValidationError('분류 이름을 입력하세요.')
    
    // TODO: transaction
    const maxPosition = (await this.categoryRepository.find({
      where: {user},
      order: {position: 'DESC'},
      take: 1,
    }))[0]?.position
    const nextPosition = maxPosition != null ? maxPosition + 1 : 0
    const category = new Category()
    category.user_id = user.id
    category.name = name
    category.position = nextPosition.toString()
    return this.categoryRepository.save(category)
  }
}
