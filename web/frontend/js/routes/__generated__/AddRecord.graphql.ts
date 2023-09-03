import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddRecordRouteQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AddRecordRouteQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null };

export type AddRecord_CreateRecordMutationVariables = Types.Exact<{
  input: Types.CreateRecordInput;
}>;


export type AddRecord_CreateRecordMutation = { __typename?: 'Mutation', createRecord: { __typename?: 'CreateRecordResult', record: { __typename?: 'Record', databaseId: string, work: { __typename?: 'Work', databaseId: string } | null, user: { __typename?: 'User', databaseId: string } | null } } };


export const AddRecordRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddRecordRoute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AddRecordRouteQuery, AddRecordRouteQueryVariables>;
export const AddRecord_CreateRecordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddRecord_createRecord"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddRecord_CreateRecordMutation, AddRecord_CreateRecordMutationVariables>;