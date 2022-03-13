import { Static, TSchema } from "@sinclair/typebox";

export type Endpoint = {
  Params: TSchema,
  Result: TSchema,
  handler: (params: any) => any | Promise<any>,
}

export function createEndpoint<P extends TSchema, R extends TSchema>(
  Params: P,
  Result: R,
  handler: (params: Static<P>) => Static<R> | Promise<Static<R>>
): Endpoint {
  return {
    Params,
    Result,
    handler,
  }
}
