import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('jsonb')
  metadata!: {} | null;

  /**
   * @deprecated Use annIds
   */
  @Column('integer')
  ann_id!: number | null;
}
