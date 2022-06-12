import { Client } from './client';
import { UserDTO, UserFetchOptions } from './types';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export type Loader = {
  callV4<T = any>(path: string, params?: any): Promise<T>;
  v5: Client;
  getCurrentUser(params?: { options?: UserFetchOptions }): Promise<UserDTO | null>;
  graphql<Result, Variables>(doc: TypedDocumentNode<Result, Variables>, variables?: Variables): Promise<Result>;
};
