import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { StatusType } from "./status_type";
import { User } from "./user.entity";

@Entity({
  name: 'record_record',
})
export class Record {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: number;
  
  @Column()
  work_id!: number;

  @Column()
  title!: string;
  
  @Column()
  status!: string;

  @Column()
  status_type!: StatusType;

  @Column('integer')
  category_id!: number | null;
  
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column('timestamp with time zone')
  updated_at!: Date | null;

  @Column('integer')
  rating!: number | null;
}
