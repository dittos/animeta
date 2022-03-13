import { Type } from "@sinclair/typebox";
import { ApiException } from "src/controllers/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

const Params = Type.Object({
  id: Type.String(),
})

const Result = CompanyDto

export default createEndpoint(Params, Result, async (params) => {
  const company = await db.findOne(Company, params.id)
  if (!company) throw ApiException.notFound()
  return serializeCompany(company)
})
