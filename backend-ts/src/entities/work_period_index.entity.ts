import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'search_workperiodindex',
})
export class WorkPeriodIndex {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @Column()
  period!: string;

  /**
   * @deprecated Use Work.first_period
   */
  @Column()
  is_first_period!: boolean;
}
