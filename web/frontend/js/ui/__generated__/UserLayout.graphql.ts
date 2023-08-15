import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type UserLayout_CommonPrivateQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type UserLayout_CommonPrivateQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null, user: { __typename?: 'User', name: string | null, joinedAt: any | null, isCurrentUser: boolean, recordCount: number | null, postCount: number | null } | null };

export type UserLayout_CurrentUserFragment = { __typename?: 'User', name: string | null };

export type UserLayout_UserFragment = { __typename?: 'User', name: string | null, joinedAt: any | null, isCurrentUser: boolean, recordCount: number | null, postCount: number | null };

export const UserLayout_CurrentUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLayout_currentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<UserLayout_CurrentUserFragment, unknown>;
export const UserLayout_UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLayout_user"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrentUser"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}},{"kind":"Field","name":{"kind":"Name","value":"postCount"}}]}}]} as unknown as DocumentNode<UserLayout_UserFragment, unknown>;
export const UserLayout_CommonPrivateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserLayout_commonPrivate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_currentUser"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"user"},"name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_user"}}]}}]}},...UserLayout_CurrentUserFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions]} as unknown as DocumentNode<UserLayout_CommonPrivateQuery, UserLayout_CommonPrivateQueryVariables>;