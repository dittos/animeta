import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { UserLayout_CurrentUserFragmentDoc, UserLayout_UserFragmentDoc } from '../../ui/__generated__/UserLayout.graphql';
export type ManageCategoryRouteQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ManageCategoryRouteQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', name: string | null, id: string, joinedAt: any | null, isCurrentUser: boolean, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null };

export type ManageCategory_CategoryFragment = { __typename?: 'Category', id: string, name: string };

export type ManageCategory_CreateCategoryMutationVariables = Types.Exact<{
  input: Types.CreateCategoryInput;
}>;


export type ManageCategory_CreateCategoryMutation = { __typename?: 'Mutation', createCategory: { __typename?: 'CreateCategoryResult', category: { __typename?: 'Category', id: string, name: string } } };

export type ManageCategory_RenameCategoryMutationVariables = Types.Exact<{
  input: Types.RenameCategoryInput;
}>;


export type ManageCategory_RenameCategoryMutation = { __typename?: 'Mutation', renameCategory: { __typename?: 'RenameCategoryResult', category: { __typename?: 'Category', id: string, name: string } } };

export type ManageCategory_DeleteCategoryMutationVariables = Types.Exact<{
  input: Types.DeleteCategoryInput;
}>;


export type ManageCategory_DeleteCategoryMutation = { __typename?: 'Mutation', deleteCategory: { __typename?: 'DeleteCategoryResult', deleted: boolean } };

export type ManageCategory_UpdateCategoryOrderMutationVariables = Types.Exact<{
  input: Types.UpdateCategoryOrderInput;
}>;


export type ManageCategory_UpdateCategoryOrderMutation = { __typename?: 'Mutation', updateCategoryOrder: { __typename?: 'UpdateCategoryOrderResult', categories: Array<{ __typename?: 'Category', id: string, name: string }> } };

export const ManageCategory_CategoryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ManageCategory_category"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<ManageCategory_CategoryFragment, unknown>;
export const ManageCategoryRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ManageCategoryRoute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_currentUser"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_user"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ManageCategory_category"}}]}}]}}]}},...UserLayout_CurrentUserFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...ManageCategory_CategoryFragmentDoc.definitions]} as unknown as DocumentNode<ManageCategoryRouteQuery, ManageCategoryRouteQueryVariables>;
export const ManageCategory_CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageCategory_createCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ManageCategory_category"}}]}}]}}]}},...ManageCategory_CategoryFragmentDoc.definitions]} as unknown as DocumentNode<ManageCategory_CreateCategoryMutation, ManageCategory_CreateCategoryMutationVariables>;
export const ManageCategory_RenameCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageCategory_renameCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RenameCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renameCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ManageCategory_category"}}]}}]}}]}},...ManageCategory_CategoryFragmentDoc.definitions]} as unknown as DocumentNode<ManageCategory_RenameCategoryMutation, ManageCategory_RenameCategoryMutationVariables>;
export const ManageCategory_DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageCategory_deleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleted"}}]}}]}}]} as unknown as DocumentNode<ManageCategory_DeleteCategoryMutation, ManageCategory_DeleteCategoryMutationVariables>;
export const ManageCategory_UpdateCategoryOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageCategory_updateCategoryOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategoryOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ManageCategory_category"}}]}}]}}]}},...ManageCategory_CategoryFragmentDoc.definitions]} as unknown as DocumentNode<ManageCategory_UpdateCategoryOrderMutation, ManageCategory_UpdateCategoryOrderMutationVariables>;