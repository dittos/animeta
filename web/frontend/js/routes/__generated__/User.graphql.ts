import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Library_UserFragmentDoc } from '../../ui/__generated__/Library.graphql';
import { LibraryFilter_RecordFiltersFragmentDoc, LibraryFilter_RecordFilterFragmentDoc } from '../../ui/__generated__/LibraryFilter.graphql';
export type UserRouteQueryVariables = Types.Exact<{
  username: Types.Scalars['String'];
  statusTypeFilter: Types.InputMaybe<Types.StatusType>;
  categoryIdFilter: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type UserRouteQuery = { __typename?: 'Query', gqlUser: { __typename?: 'User', recordFilters: { __typename?: 'RecordFilters', statusType: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> }, categoryId: { __typename?: 'RecordFilter', allCount: number, items: Array<{ __typename?: 'RecordFilterItem', key: string, count: number }> } } } | null };


export const UserRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statusTypeFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"StatusType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryIdFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"gqlUser"},"name":{"kind":"Name","value":"userByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Library_user"}}]}}]}},...Library_UserFragmentDoc.definitions,...LibraryFilter_RecordFiltersFragmentDoc.definitions,...LibraryFilter_RecordFilterFragmentDoc.definitions]} as unknown as DocumentNode<UserRouteQuery, UserRouteQueryVariables>;