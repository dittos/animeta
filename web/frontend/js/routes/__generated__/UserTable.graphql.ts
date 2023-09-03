import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { TableItem_ItemFragmentDoc, TableItem_Item_RecordFragmentDoc } from '../../ui/__generated__/TableItem.graphql';
export type UserTableRouteQueryVariables = Types.Exact<{
  period: Types.Scalars['String'];
  username: Types.Scalars['String'];
  withRecommendations: Types.Scalars['Boolean'];
}>;


export type UserTableRouteQuery = { __typename?: 'Query', user: { __typename?: 'User', name: string | null } | null, tablePeriod: { __typename?: 'TablePeriod', period: string, year: number, month: number, items: Array<{ __typename?: 'TablePeriodItem', title: string, recommendationScore: number | null, work: { __typename?: 'Work', databaseId: string, title: string | null, imageUrl: string | null, recordCount: number | null, metadata: { __typename?: 'WorkMetadata', periods: Array<string> | null, studioNames: Array<string> | null, source: Types.SourceType | null, websiteUrl: string | null, namuwikiUrl: string | null, annUrl: string | null, durationMinutes: number | null, schedules: Array<{ __typename?: 'WorkSchedule', country: string, date: any | null, datePrecision: Types.DatePrecision | null, broadcasts: Array<string> | null }> | null } | null }, record: { __typename?: 'Record', databaseId: string, status: string | null, statusType: Types.StatusType | null } | null, recommendations: Array<{ __typename?: 'RecommendationByCredit', score: number | null, credit: { __typename?: 'Credit', type: Types.CreditType | null, name: string | null } | null, related: Array<{ __typename?: 'WorkCredit', workTitle: string, type: Types.CreditType | null }> | null }> | null }> } | null };

export type UserTableRoute_ItemFragment = { __typename?: 'TablePeriodItem', work: { __typename?: 'Work', databaseId: string }, record: { __typename?: 'Record', databaseId: string } | null };

export const UserTableRoute_ItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserTableRoute_item"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TablePeriodItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}}]}}]} as unknown as DocumentNode<UserTableRoute_ItemFragment, unknown>;
export const UserTableRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserTableRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withRecommendations"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"user"},"name":{"kind":"Name","value":"userByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tablePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"onlyAdded"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"withRecommendations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withRecommendations"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserTableRoute_item"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"TableItem_item"}}]}}]}}]}},...UserTableRoute_ItemFragmentDoc.definitions,...TableItem_ItemFragmentDoc.definitions,...TableItem_Item_RecordFragmentDoc.definitions]} as unknown as DocumentNode<UserTableRouteQuery, UserTableRouteQueryVariables>;