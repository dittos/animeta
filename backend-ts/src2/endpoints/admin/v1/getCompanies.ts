import { Type } from "@sinclair/typebox";
import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

const Params = Type.Object({
})

const Result = Type.Array(CompanyDto)

export default createEndpoint(Params, Result, async () => {
  const companies = await db.find(Company, {order: {name: 'ASC'}})
  return Promise.all(companies.map(it => serializeCompany(it, false)))
})
