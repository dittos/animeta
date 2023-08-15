import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddRecordDialogQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AddRecordDialogQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', isTwitterConnected: boolean | null, categories: Array<{ __typename?: 'Category', databaseId: string, name: string }> } | null };

export type AddRecordDialog_CategoryFragment = { __typename?: 'Category', databaseId: string, name: string };

export const AddRecordDialog_CategoryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddRecordDialog_category"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<AddRecordDialog_CategoryFragment, unknown>;
export const AddRecordDialogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddRecordDialog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isTwitterConnected"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddRecordDialog_category"}}]}}]}}]}},...AddRecordDialog_CategoryFragmentDoc.definitions]} as unknown as DocumentNode<AddRecordDialogQuery, AddRecordDialogQueryVariables>;