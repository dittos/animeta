import { LATEST_WORK_METADATA_VERSION } from "src/entities/work_metadata";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { getOrCreateWork, applyWorkMetadata } from "src/services/work";

export default async function(params: {
  title: string,
  namuRef: string | null,
  period: string | null,
}): Promise<AdminWorkDto> {
  const work = await getOrCreateWork(params.title)
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
