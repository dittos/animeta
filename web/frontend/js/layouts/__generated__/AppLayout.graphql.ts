import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AppLayoutQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppLayoutQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null };


export const AppLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AppLayoutQuery, AppLayoutQueryVariables>;