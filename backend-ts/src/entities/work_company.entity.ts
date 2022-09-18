import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company.entity";
import { Work } from "./work.entity";

@Entity({
  name: 'work_company'
})
export class WorkCompany {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  work_id!: number;

  @ManyToOne(() => Work)
  @JoinColumn({name: 'work_id'})
  work?: Work;

  @Column()
  position!: number;

  @ManyToOne(() => Company)
  @JoinColumn({name: 'company_id'})
  company!: Company;
}
