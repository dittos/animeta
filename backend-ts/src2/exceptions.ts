// Note that this is used for Fastify server
// See https://www.fastify.io/docs/latest/Reference/Reply/#errors
export class ApiException extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
  }

  static notFound() {
    return new ApiException("Not found.", 404)
  }
  static permissionDenied() {
    return new ApiException("Permission denied.", 403)
  }
}
