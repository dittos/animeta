import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('jsonb')
  metadata!: {} | null;

  @Column('integer')
  ann_id!: number | null;
}
