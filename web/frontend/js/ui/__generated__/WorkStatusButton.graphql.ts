import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type WorkStatusButton_WorkFragment = { __typename?: 'Work', title: string | null };

export type WorkStatusButton_RecordFragment = { __typename?: 'Record', id: string, statusType: Types.StatusType | null, status: string | null };

export const WorkStatusButton_WorkFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkStatusButton_work"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Work"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]} as unknown as DocumentNode<WorkStatusButton_WorkFragment, unknown>;
export const WorkStatusButton_RecordFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkStatusButton_record"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Record"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"statusType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<WorkStatusButton_RecordFragment, unknown>;