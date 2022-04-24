export class ValidationError extends Error {
  constructor(message: string, public extra?: any) {
    super(message);
  }
}

export class PermissionError extends Error {
}