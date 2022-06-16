import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { PostComment_PostFragmentDoc } from './GqlPostComment.graphql';
export type Post_PostFragment = { __typename?: 'Post', id: string, statusType?: Types.StatusType | null, status?: string | null, comment?: string | null, updatedAt?: any | null, containsSpoiler?: boolean | null, user?: { __typename?: 'User', name?: string | null } | null, record?: { __typename?: 'Record', title?: string | null } | null };

export const Post_PostFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Post_post"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Post"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PostComment_post"}}]}},...PostComment_PostFragmentDoc.definitions]} as unknown as DocumentNode<Post_PostFragment, unknown>;