import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";

@Entity({
  name: 'work_cast'
})
export class WorkCast {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @Column()
  role!: string;

  @Column()
  position!: number;

  @ManyToOne(() => Person)
  @JoinColumn({name: 'actor_id'})
  actor!: Person;

  @Column('jsonb')
  metadata!: {} | null;
}
