import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";
import { Work } from "./work.entity";

@Entity({
  name: 'work_staff'
})
export class WorkStaff {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @ManyToOne(() => Work)
  @JoinColumn({name: 'work_id'})
  work?: Work;

  @Column()
  task!: string;

  @Column()
  position!: number;

  @ManyToOne(() => Person)
  @JoinColumn({name: 'person_id'})
  person!: Person;

  @Column('jsonb')
  metadata!: {} | null;
}
