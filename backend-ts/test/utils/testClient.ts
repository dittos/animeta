import { createMercuriusTestClient, GQLResponse, QueryOptions } from 'mercurius-integration-testing'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode, FragmentDefinitionNode, Kind, print } from 'graphql';
import { FastifyInstance } from 'fastify';

export function gql(literals: TemplateStringsArray, ...args: any[]): string {
  let result = literals[0]
  const fragmentDefinitions = new Map<string, FragmentDefinitionNode>()
  args.forEach((arg, i) => {
    if (arg.kind === Kind.DOCUMENT) {
      const doc: DocumentNode = arg
      doc.definitions.forEach(def => {
        if (def.kind === Kind.FRAGMENT_DEFINITION) {
          const name = def.name.value
          fragmentDefinitions.set(name, def)
        }
      })
    } else {
      result += arg
    }
    result += literals[i + 1]
  })
  for (const def of fragmentDefinitions.values()) {
    result += print(def)
  }
  return result
}

export class TestClient {
  private readonly client: ReturnType<typeof createMercuriusTestClient>

  constructor(
    private readonly app: FastifyInstance,
    options?: Parameters<typeof createMercuriusTestClient>[1],
  ) {
    this.client = createMercuriusTestClient(app, options)
  }

  call(path: string, params: any) {
    return this.app.inject().headers(this.client.headers).post(path).payload(params)
  }

  async query<TData extends Record<string, unknown> = Record<string, any>, TVariables extends Record<string, unknown> | undefined = undefined>(
    query: TypedDocumentNode<TData, TVariables> | DocumentNode | string,
    queryOptions?: QueryOptions<TVariables>
  ): Promise<GQLResponse<TData>> {
    const response = await this.client.query(query, queryOptions)
    expect(response.errors).toBeFalsy()
    return response
  }

  async rawQuery<TData extends Record<string, unknown> = Record<string, any>, TVariables extends Record<string, unknown> | undefined = undefined>(
    query: TypedDocumentNode<TData, TVariables> | DocumentNode | string,
    queryOptions?: QueryOptions<TVariables>
  ): Promise<GQLResponse<TData>> {
    return await this.client.query(query, queryOptions)
  }
}
