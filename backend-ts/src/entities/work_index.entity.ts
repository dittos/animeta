import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: 'search_workindex',
})
export class WorkIndex {
  @PrimaryColumn()
  work_id: number;

  @Column()
  title: string;

  @Column()
  record_count: number;

  @Column()
  blacklisted: boolean;

  @Column()
  verified: boolean;
}
