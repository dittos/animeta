import * as Types from './globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetCurrentTablePeriodQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetCurrentTablePeriodQuery = { __typename?: 'Query', currentTablePeriod: { __typename?: 'TablePeriod', period: string } };


export const GetCurrentTablePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentTablePeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentTablePeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<GetCurrentTablePeriodQuery, GetCurrentTablePeriodQueryVariables>;