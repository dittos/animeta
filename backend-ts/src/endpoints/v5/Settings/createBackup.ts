import { FastifyRequest } from "fastify";
import { requireUser } from "src/auth";
import { createBackup } from "src/services/backup";

export default async function handle(params: {}, request: FastifyRequest): Promise<{
  downloadUrl: string;
}> {
  const currentUser = await requireUser(request)
  return {
    downloadUrl: await createBackup(currentUser)
  }
}
