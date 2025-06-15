import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { UserLayout_CurrentUserFragmentDoc, UserLayout_UserFragmentDoc } from '../../ui/__generated__/UserLayout.graphql';
import { GlobalHeader_TablePeriodNoticeFragmentDoc } from '../../ui/__generated__/GlobalHeader.graphql';
export type CurrentUserLayoutQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserLayoutQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null, user: { __typename?: 'User', name: string | null, joinedAt: any | null, isCurrentUser: boolean, recordCount: number | null, postCount: number | null } | null, tablePeriodNotice: { __typename?: 'TablePeriodNotice', id: string, content: string, showUntil: any | null } | null };


export const CurrentUserLayoutDocument = {"kind":"Document", "definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUserLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_currentUser"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"user"},"name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tablePeriodNotice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlobalHeader_tablePeriodNotice"}}]}}]}},...UserLayout_CurrentUserFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...GlobalHeader_TablePeriodNoticeFragmentDoc.definitions]} as unknown as DocumentNode<CurrentUserLayoutQuery, CurrentUserLayoutQueryVariables>;