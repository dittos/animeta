import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'work_work',
})
export class Work {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  image_filename!: string | null;

  @Column()
  original_image_filename!: string | null;

  @Column()
  image_center_y!: number;

  @Column()
  blacklisted!: boolean;
}
