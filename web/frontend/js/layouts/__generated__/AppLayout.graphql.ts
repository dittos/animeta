import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { GlobalHeader_TablePeriodNoticeFragmentDoc } from '../../ui/__generated__/GlobalHeader.graphql';
export type AppLayoutQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppLayoutQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null, tablePeriodNotice: { __typename?: 'TablePeriodNotice', id: string, content: string, showUntil: any | null } | null };


export const AppLayoutDocument = {"kind":"Document", "definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tablePeriodNotice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlobalHeader_tablePeriodNotice"}}]}}]}},...GlobalHeader_TablePeriodNoticeFragmentDoc.definitions]} as unknown as DocumentNode<AppLayoutQuery, AppLayoutQueryVariables>;