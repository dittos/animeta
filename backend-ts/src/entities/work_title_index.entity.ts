import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'search_worktitleindex',
})
export class WorkTitleIndex {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  key!: string;

  @Column()
  work_id!: number;
}
