import { Client } from './client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

export type Loader = {
  v5: Client;
  graphql<Result, Variables>(doc: TypedDocumentNode<Result, Variables>, variables?: Variables): Promise<Result>;
};
