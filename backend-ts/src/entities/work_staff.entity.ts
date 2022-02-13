import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";

@Entity({
  name: 'work_staff'
})
export class WorkStaff {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

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
