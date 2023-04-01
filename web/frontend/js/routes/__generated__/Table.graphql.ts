import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { TableItem_ItemFragmentDoc, TableItem_Item_RecordFragmentDoc } from '../../ui/__generated__/TableItem.graphql';
export type TableRouteQueryVariables = Types.Exact<{
  period: Types.Scalars['String'];
  withRecommendations: Types.Scalars['Boolean'];
}>;


export type TableRouteQuery = { __typename?: 'Query', tablePeriods: Array<{ __typename?: 'TablePeriod', period: string, year: number, month: number }>, tablePeriod: { __typename?: 'TablePeriod', isRecommendationEnabled: boolean, isCurrent: boolean, period: string, year: number, month: number, items: Array<{ __typename?: 'TablePeriodItem', title: string, recommendationScore: number | null, work: { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null, recordCount: number | null, metadata: { __typename?: 'WorkMetadata', periods: Array<string> | null, studioNames: Array<string> | null, source: Types.SourceType | null, websiteUrl: string | null, namuwikiUrl: string | null, annUrl: string | null, durationMinutes: number | null, schedules: Array<{ __typename?: 'WorkSchedule', country: string, date: any | null, datePrecision: Types.DatePrecision | null, broadcasts: Array<string> | null }> | null } | null }, record: { __typename?: 'Record', id: string, status: string | null, statusType: Types.StatusType | null } | null, recommendations: Array<{ __typename?: 'RecommendationByCredit', score: number | null, credit: { __typename?: 'Credit', type: Types.CreditType | null, name: string | null, personId: string } | null, related: Array<{ __typename?: 'WorkCredit', workId: string, workTitle: string, type: Types.CreditType | null }> | null }> | null }> } | null };

export type TableRoute_PageTitleFragment = { __typename?: 'TablePeriod', period: string, year: number, month: number };

export type TableRoute_ItemFragment = { __typename?: 'TablePeriodItem', work: { __typename?: 'Work', id: string }, record: { __typename?: 'Record', id: string } | null };

export const TableRoute_PageTitleFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TableRoute_pageTitle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TablePeriod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}}]}}]} as unknown as DocumentNode<TableRoute_PageTitleFragment, unknown>;
export const TableRoute_ItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TableRoute_item"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TablePeriodItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TableRoute_ItemFragment, unknown>;
export const TableRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TableRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withRecommendations"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tablePeriods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tablePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TableRoute_pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"isRecommendationEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"withRecommendations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withRecommendations"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TableRoute_item"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"TableItem_item"}}]}}]}}]}},...TableRoute_PageTitleFragmentDoc.definitions,...TableRoute_ItemFragmentDoc.definitions,...TableItem_ItemFragmentDoc.definitions,...TableItem_Item_RecordFragmentDoc.definitions]} as unknown as DocumentNode<TableRouteQuery, TableRouteQueryVariables>;