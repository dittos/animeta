import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";
import { Work } from "./work.entity";

@Entity({
  name: 'work_cast'
})
export class WorkCast {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @ManyToOne(() => Work)
  @JoinColumn({name: 'work_id'})
  work?: Work;

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
