import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { UserLayout_CurrentUserFragmentDoc, UserLayout_UserFragmentDoc } from '../../ui/__generated__/UserLayout.graphql';
export type UserLayoutQueryVariables = Types.Exact<{
  username: Types.Scalars['String'];
}>;


export type UserLayoutQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null } | null, user: { __typename?: 'User', name: string | null, joinedAt: any | null, isCurrentUser: boolean, recordCount: number | null, postCount: number | null } | null };


export const UserLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_currentUser"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"user"},"name":{"kind":"Name","value":"userByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_user"}}]}}]}},...UserLayout_CurrentUserFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions]} as unknown as DocumentNode<UserLayoutQuery, UserLayoutQueryVariables>;