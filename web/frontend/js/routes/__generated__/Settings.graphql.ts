import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SettingsRouteQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SettingsRouteQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', isTwitterConnected: boolean | null } | null };


export const SettingsRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsRoute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isTwitterConnected"}}]}}]}}]} as unknown as DocumentNode<SettingsRouteQuery, SettingsRouteQueryVariables>;