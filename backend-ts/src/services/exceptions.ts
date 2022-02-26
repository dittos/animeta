export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PermissionError extends Error {
}