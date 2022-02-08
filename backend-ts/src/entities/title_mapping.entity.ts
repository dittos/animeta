import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'work_titlemapping'
})
export class TitleMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @Column()
  title!: string;

  @Column()
  key!: string;
}
