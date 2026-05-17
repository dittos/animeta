import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode, FragmentDefinitionNode, Kind, print } from 'graphql';

export interface GQLResponse<TData = Record<string, unknown>> {
  data: TData;
  errors?: unknown[];
}

export interface QueryOptions<TVariables> {
  variables?: TVariables;
}

export interface HttpResponse<T = any> {
  statusCode: number;
  json(): T;
  text(): string;
}

export function gql(literals: TemplateStringsArray, ...args: any[]): string {
  let result = literals[0];
  const fragmentDefinitions = new Map<string, FragmentDefinitionNode>();
  args.forEach((arg, i) => {
    if (arg?.kind === Kind.DOCUMENT) {
      const doc: DocumentNode = arg;
      doc.definitions.forEach(def => {
        if (def.kind === Kind.FRAGMENT_DEFINITION) {
          fragmentDefinitions.set(def.name.value, def);
        }
      });
    } else {
      result += arg;
    }
    result += literals[i + 1];
  });
  for (const def of fragmentDefinitions.values()) {
    result += print(def);
  }
  return result;
}

function getBaseUrl(): string {
  const baseUrl = process.env.ANIMETA_BASE_URL;
  if (!baseUrl) throw new Error('ANIMETA_BASE_URL is not set');
  return baseUrl.replace(/\/$/, '');
}

async function parseResponse(response: Response): Promise<HttpResponse> {
  const body = await response.text();
  return {
    statusCode: response.status,
    json() {
      return body ? JSON.parse(body) : null;
    },
    text() {
      return body;
    },
  };
}

export class TestClient {
  constructor(private readonly headers: Record<string, string> = {}) {}

  async call<T = any>(path: string, params: unknown): Promise<HttpResponse<T>> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify(params),
    });
    return parseResponse(response) as Promise<HttpResponse<T>>;
  }

  async query<TData extends Record<string, unknown> = Record<string, any>, TVariables extends Record<string, unknown> | undefined = undefined>(
    query: TypedDocumentNode<TData, TVariables> | DocumentNode | string,
    queryOptions?: QueryOptions<TVariables>,
  ): Promise<GQLResponse<TData>> {
    const response = await this.rawQuery<TData, TVariables>(query, queryOptions);
    expect(response.errors).toBeFalsy();
    return response;
  }

  async rawQuery<TData extends Record<string, unknown> = Record<string, any>, TVariables extends Record<string, unknown> | undefined = undefined>(
    query: TypedDocumentNode<TData, TVariables> | DocumentNode | string,
    queryOptions?: QueryOptions<TVariables>,
  ): Promise<GQLResponse<TData>> {
    const body = {
      query: typeof query === 'string' ? query : print(query),
      variables: queryOptions?.variables,
    };
    const response = await fetch(`${getBaseUrl()}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify(body),
    });
    return response.json() as Promise<GQLResponse<TData>>;
  }
}
