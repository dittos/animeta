import { LATEST_WORK_METADATA_VERSION } from "src/entities/work_metadata";
import { getOrCreateWork } from "src/services/work.service";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";
import { applyWorkMetadata } from "src2/services/work";

export default async function(params: {
  title: string,
  namuRef: string | null,
  period: string | null,
}): Promise<AdminWorkDto> {
  const work = await getOrCreateWork(db, params.title)
  if (params.namuRef) {
    const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
    await applyWorkMetadata(work, {
      ...metadata,
      namuRef: params.namuRef,
      ...params.period ? {periods: [params.period]} : {},
    })
  }
  return serializeAdminWork(work)
}
