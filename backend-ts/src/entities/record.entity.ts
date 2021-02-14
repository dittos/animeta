import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StatusType } from "./status_type";
import { User } from "./user.entity";

@Entity({
  name: 'record_record',
})
export class Record {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column()
  work_id: number;

  @Column()
  title: string;
  
  @Column()
  status: string;

  @Column()
  status_type: StatusType;

  // TODO: category

  @Column()
  updated_at: Date | null;

  @Column()
  rating: number | null;
}
