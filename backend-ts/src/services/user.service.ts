import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { User } from "src/entities/user.entity";
import { objResults } from "src/utils/dataloader";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  private dataLoader = new DataLoader<number, User>(
    objResults(ids => this.load(ids), k => `${k}`, v => `${v.id}`),
    { cache: false }
  );
  
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  get(id: number): Promise<User> {
    return this.dataLoader.load(id);
  }

  private async load(ids: readonly number[]): Promise<User[]> {
    return this.userRepository.findByIds(Array.from(ids));
  }
}
