import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { WorkMetadata } from "./work_metadata";

@Entity({
  name: 'work_work',
})
export class Work {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('varchar')
  image_filename!: string | null;

  @Column('varchar')
  original_image_filename!: string | null;

  @Column()
  image_center_y!: number;

  @Column('jsonb')
  metadata!: WorkMetadata | null;

  @Column()
  blacklisted!: boolean;

  @Column('varchar')
  first_period!: string | null;
}
