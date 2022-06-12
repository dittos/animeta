import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Post_PostFragmentDoc } from '../../ui/__generated__/GqlPost.graphql';
export type IndexRouteQueryVariables = Types.Exact<{
  timelineBeforeId?: Types.InputMaybe<Types.Scalars['ID']>;
  count?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type IndexRouteQuery = { __typename?: 'Query', timeline?: Array<{ __typename?: 'Post', id: string, statusType?: Types.StatusType | null, status?: string | null, comment?: string | null, updatedAt?: any | null, containsSpoiler?: boolean | null, user?: { __typename?: 'User', name?: string | null } | null, record?: { __typename?: 'Record', title?: string | null } | null } | null> | null };


export const IndexRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndexRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timelineBeforeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"beforeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timelineBeforeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Post_post"}}]}}]}},...Post_PostFragmentDoc.definitions]} as unknown as DocumentNode<IndexRouteQuery, IndexRouteQueryVariables>;