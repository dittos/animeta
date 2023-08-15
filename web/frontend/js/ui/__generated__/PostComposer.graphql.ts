import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type PostComposer_RecordFragment = { __typename?: 'Record', statusType: Types.StatusType | null, status: string | null };

export const PostComposer_RecordFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PostComposer_record"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Record"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<PostComposer_RecordFragment, unknown>;