import { HttpStatus } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { ApiException } from "src/controllers/exceptions";
import { getCurrentUser } from "src2/auth";

export default async function(request: FastifyRequest, reply: FastifyReply) {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new ApiException("Login required.", HttpStatus.UNAUTHORIZED)
  } else if (!user?.is_staff) {
    throw new ApiException("Staff permission required.", HttpStatus.UNAUTHORIZED)
  } else {
    // ok
  }
}
