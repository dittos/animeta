import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type LibraryFilter_RecordFiltersFragment = { __typename?: 'RecordFilters', statusType: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> }, categoryId: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> } };

export type LibraryFilter_RecordFilterFragment = { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> };

export const LibraryFilter_RecordFilterFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryFilter_recordFilter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RecordFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<LibraryFilter_RecordFilterFragment, unknown>;
export const LibraryFilter_RecordFiltersFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryFilter_recordFilters"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RecordFilters"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryFilter_recordFilter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryFilter_recordFilter"}}]}}]}}]} as unknown as DocumentNode<LibraryFilter_RecordFiltersFragment, unknown>;