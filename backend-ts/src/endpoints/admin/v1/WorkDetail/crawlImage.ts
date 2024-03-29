import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import * as tempy from "tempy";
import * as cuid from "cuid";
import { download, downloadAnnPoster, generateThumbnail, upload } from "src/services/admin/image";

export default async function(params: {
  workId: string;
  options: {
    source: 'ann';
    annId: string;
  } | {
    source: 'url';
    url: string;
  };
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.workId)
  const options = params.options
  await tempy.file.task(async tempFile => {
    await tempy.file.task(async tempThumbFile => {
      switch (options.source) {
        case 'ann':
          await downloadAnnPoster(options.annId, tempFile)
          await generateThumbnail(tempFile, tempThumbFile)
          work.original_image_filename = `ann${options.annId}.jpg`
          work.image_filename = `thumb/v2/${work.original_image_filename}`
          await upload(tempFile, work.original_image_filename)
          await upload(tempThumbFile, work.image_filename)
          await db.save(work)
          break;
        case 'url':
          await download(options.url, tempFile)
          await generateThumbnail(tempFile, tempThumbFile)
          work.original_image_filename = cuid()
          work.image_filename = `thumb/${work.original_image_filename}`
          await upload(tempFile, work.original_image_filename)
          await upload(tempThumbFile, work.image_filename)
          await db.save(work)
          break;
      }
    }, {extension: 'jpg'})
  })
  return serializeAdminWork(work)
}
