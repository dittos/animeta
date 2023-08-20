import { FastifyRequest } from "fastify";
import { requireUser } from "src2/auth";
import { createBackup } from "src2/services/backup";

export default async function handle(params: {}, request: FastifyRequest): Promise<{
  downloadUrl: string;
}> {
  const currentUser = await requireUser(request)
  return {
    downloadUrl: await createBackup(currentUser)
  }
}
