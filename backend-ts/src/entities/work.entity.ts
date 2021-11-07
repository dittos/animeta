import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'work_work',
})
export class Work {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  image_filename: string | null;
}
