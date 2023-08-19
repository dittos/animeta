import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ManageRatingRoute_UpdateRatingMutationVariables = Types.Exact<{
  input: Types.UpdateRecordRatingInput;
}>;


export type ManageRatingRoute_UpdateRatingMutation = { __typename?: 'Mutation', updateRecordRating: { __typename?: 'UpdateRecordRatingResult', record: { __typename?: 'Record', databaseId: string } } };


export const ManageRatingRoute_UpdateRatingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageRatingRoute_updateRating"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRecordRatingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecordRating"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}}]}}]}}]} as unknown as DocumentNode<ManageRatingRoute_UpdateRatingMutation, ManageRatingRoute_UpdateRatingMutationVariables>;