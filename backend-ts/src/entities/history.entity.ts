import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";
import { StatusType } from "./status_type";
import { User } from "./user.entity";

@Entity({
  name: 'record_history',
})
export class History {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: number;
  
  @Column()
  work_id!: number;
  
  @ManyToOne(() => Record)
  @JoinColumn({ name: 'record_id' })
  record!: Record;

  @Column()
  record_id!: number;
  
  @Column()
  status!: string;

  @Column()
  status_type!: StatusType;

  @Column()
  comment!: string;

  @Column('timestamp with time zone')
  updated_at!: Date | null;

  @Column('boolean')
  contains_spoiler!: boolean;

  @Column('numeric', {
    precision: 4,
    scale: 1,
  })
  rating!: number | null;
}
