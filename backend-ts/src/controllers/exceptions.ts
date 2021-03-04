import { HttpException, HttpStatus } from "@nestjs/common";

export class ApiException extends HttpException {
  constructor(message: string, statusCode: HttpStatus, extra?: any) {
    super({
      message,
      extra,
    }, statusCode)
  }

  static notFound() {
    return new ApiException("Not found.", HttpStatus.NOT_FOUND)
  }
  static permissionDenied() {
    return new ApiException("Permission denied.", HttpStatus.FORBIDDEN)
  }
}
