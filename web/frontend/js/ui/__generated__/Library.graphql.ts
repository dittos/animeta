import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { LibraryFilter_RecordFiltersFragmentDoc, LibraryFilter_RecordFilterFragmentDoc } from './LibraryFilter.graphql';
export type Library_UserFragment = { __typename?: 'User', recordFilters: { __typename?: 'RecordFilters', statusType: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> }, categoryId: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> } } };

export type Library_CreateRecordMutationVariables = Types.Exact<{
  input: Types.CreateRecordInput;
}>;


export type Library_CreateRecordMutation = { __typename?: 'Mutation', createRecord: { __typename?: 'CreateRecordResult', record: { __typename?: 'Record', id: string } } };

export const Library_UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Library_user"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordFilters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"statusType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statusTypeFilter"}}},{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryIdFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryFilter_recordFilters"}}]}}]}}]} as unknown as DocumentNode<Library_UserFragment, unknown>;
export const Library_CreateRecordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Library_createRecord"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<Library_CreateRecordMutation, Library_CreateRecordMutationVariables>;