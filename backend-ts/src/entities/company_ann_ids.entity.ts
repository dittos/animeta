import { Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: 'company_ann_ids'
})
export class CompanyAnnIds {
  @PrimaryColumn()
  company_id!: number;

  @PrimaryColumn()
  ann_ids!: number;
}
