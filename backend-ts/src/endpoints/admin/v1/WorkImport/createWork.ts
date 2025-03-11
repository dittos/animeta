import { db } from "src/database";
import { LATEST_WORK_METADATA_VERSION, WorkMetadata } from "src/entities/work_metadata_raw";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { getAnnMetadata, GetAnnMetadataResult, importAnnMetadata } from "src/services/admin/ann";
import { crawlImage } from "src/services/admin/image";
import { ValidationError } from "src/services/exceptions";
import { applyWorkMetadata, getOrCreateWorkEx, getWork } from "src/services/work";

export default async function(params: {
  title: string,
  metadata: WorkMetadata,
}): Promise<AdminWorkDto> {
  const annId = params.metadata.annId
  let annMetadata: GetAnnMetadataResult | undefined
  if (annId) {
    annMetadata = await getAnnMetadata(annId)
  }
  return await db.transaction(async () => {
    const {work, isNew} = await getOrCreateWorkEx(params.title)
    if (!isNew) {
      throw new ValidationError('Work already exists', {id: work.id, title: work.title})
    }

    await applyWorkMetadata(work, {
      ...params.metadata,
      version: LATEST_WORK_METADATA_VERSION,
    })

    if (annId && annMetadata) {
      await importAnnMetadata(work, annMetadata)
      await crawlImage(work, {
        source: 'ann',
        annId,
      })
    }

    return await serializeAdminWork(await getWork(work.id))
  })
}
