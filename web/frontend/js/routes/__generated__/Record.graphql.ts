import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { UserLayout_CurrentUserFragmentDoc, UserLayout_UserFragmentDoc } from '../../ui/__generated__/UserLayout.graphql';
import { PostComposer_RecordFragmentDoc } from '../../ui/__generated__/PostComposer.graphql';
import { WorkViews_PostConnectionFragmentDoc } from '../../ui/__generated__/WorkViews.graphql';
import { Post_PostFragmentDoc } from '../../ui/__generated__/Post.graphql';
import { PostComment_PostFragmentDoc } from '../../ui/__generated__/GqlPostComment.graphql';
export type RecordRouteQueryVariables = Types.Exact<{
  recordId: Types.Scalars['ID'];
}>;


export type RecordRouteQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', id: string, isTwitterConnected: boolean | null, name: string | null } | null, record: { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null } | null };

export type RecordRoute_RecordFragment = { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null };

export type RecordRoute_HeaderFragment = { __typename?: 'Record', title: string | null, rating: number | null, user: { __typename?: 'User', isCurrentUser: boolean, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null };

export type RecordRoute_Header_CategoryFragment = { __typename?: 'Category', id: string, name: string };

export type RecordRoute_PostsQueryVariables = Types.Exact<{
  workId: Types.Scalars['ID'];
  beforeId: Types.InputMaybe<Types.Scalars['ID']>;
  episode: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type RecordRoute_PostsQuery = { __typename?: 'Query', work: { __typename?: 'Work', posts: { __typename?: 'PostConnection', hasMore: boolean, nodes: Array<{ __typename?: 'Post', id: string, statusType: Types.StatusType | null, status: string | null, comment: string | null, updatedAt: any | null, containsSpoiler: boolean | null, user: { __typename?: 'User', name: string | null } | null, record: { __typename?: 'Record', title: string | null } | null }> } } | null };

export type RecordRoute_UpdateTitleMutationVariables = Types.Exact<{
  input: Types.UpdateRecordTitleInput;
}>;


export type RecordRoute_UpdateTitleMutation = { __typename?: 'Mutation', updateRecordTitle: { __typename?: 'UpdateRecordTitleResult', record: { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null } } };

export type RecordRoute_UpdateCategoryMutationVariables = Types.Exact<{
  input: Types.UpdateRecordCategoryIdInput;
}>;


export type RecordRoute_UpdateCategoryMutation = { __typename?: 'Mutation', updateRecordCategoryId: { __typename?: 'UpdateRecordCategoryIdResult', record: { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null } } };

export type RecordRoute_UpdateRatingMutationVariables = Types.Exact<{
  input: Types.UpdateRecordRatingInput;
}>;


export type RecordRoute_UpdateRatingMutation = { __typename?: 'Mutation', updateRecordRating: { __typename?: 'UpdateRecordRatingResult', record: { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null } } };

export type RecordRoute_CreatePostMutationVariables = Types.Exact<{
  input: Types.CreatePostInput;
}>;


export type RecordRoute_CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'CreatePostResult', post: { __typename?: 'Post', id: string } } };

export type RecordRoute_DeletePostMutationVariables = Types.Exact<{
  input: Types.DeletePostInput;
}>;


export type RecordRoute_DeletePostMutation = { __typename?: 'Mutation', deletePost: { __typename?: 'DeletePostResult', record: { __typename?: 'Record', id: string, title: string | null, updatedAt: any | null, rating: number | null, statusType: Types.StatusType | null, status: string | null, user: { __typename?: 'User', isCurrentUser: boolean, name: string | null, id: string, joinedAt: any | null, recordCount: number | null, postCount: number | null, categories: Array<{ __typename?: 'Category', id: string, name: string }> } | null, category: { __typename?: 'Category', id: string } | null } | null } };

export type RecordRoute_DeleteRecordMutationVariables = Types.Exact<{
  input: Types.DeleteRecordInput;
}>;


export type RecordRoute_DeleteRecordMutation = { __typename?: 'Mutation', deleteRecord: { __typename?: 'DeleteRecordResult', deleted: boolean } };

export const RecordRoute_Header_CategoryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RecordRoute_header_category"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<RecordRoute_Header_CategoryFragment, unknown>;
export const RecordRoute_HeaderFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RecordRoute_header"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Record"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCurrentUser"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_header_category"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordRoute_HeaderFragment, unknown>;
export const RecordRoute_RecordFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RecordRoute_record"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Record"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCurrentUser"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_header"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PostComposer_record"}}]}}]} as unknown as DocumentNode<RecordRoute_RecordFragment, unknown>;
export const RecordRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecordRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recordId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isTwitterConnected"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLayout_currentUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"record"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recordId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_record"}}]}}]}},...UserLayout_CurrentUserFragmentDoc.definitions,...RecordRoute_RecordFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...RecordRoute_HeaderFragmentDoc.definitions,...RecordRoute_Header_CategoryFragmentDoc.definitions,...PostComposer_RecordFragmentDoc.definitions]} as unknown as DocumentNode<RecordRouteQuery, RecordRouteQueryVariables>;
export const RecordRoute_PostsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecordRoute_posts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beforeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"work"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"posts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"beforeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beforeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"episode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkViews_postConnection"}}]}}]}}]}},...WorkViews_PostConnectionFragmentDoc.definitions,...Post_PostFragmentDoc.definitions,...PostComment_PostFragmentDoc.definitions]} as unknown as DocumentNode<RecordRoute_PostsQuery, RecordRoute_PostsQueryVariables>;
export const RecordRoute_UpdateTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_updateTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRecordTitleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecordTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_record"}}]}}]}}]}},...RecordRoute_RecordFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...RecordRoute_HeaderFragmentDoc.definitions,...RecordRoute_Header_CategoryFragmentDoc.definitions,...PostComposer_RecordFragmentDoc.definitions]} as unknown as DocumentNode<RecordRoute_UpdateTitleMutation, RecordRoute_UpdateTitleMutationVariables>;
export const RecordRoute_UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_updateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRecordCategoryIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecordCategoryId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_record"}}]}}]}}]}},...RecordRoute_RecordFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...RecordRoute_HeaderFragmentDoc.definitions,...RecordRoute_Header_CategoryFragmentDoc.definitions,...PostComposer_RecordFragmentDoc.definitions]} as unknown as DocumentNode<RecordRoute_UpdateCategoryMutation, RecordRoute_UpdateCategoryMutationVariables>;
export const RecordRoute_UpdateRatingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_updateRating"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRecordRatingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecordRating"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_record"}}]}}]}}]}},...RecordRoute_RecordFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...RecordRoute_HeaderFragmentDoc.definitions,...RecordRoute_Header_CategoryFragmentDoc.definitions,...PostComposer_RecordFragmentDoc.definitions]} as unknown as DocumentNode<RecordRoute_UpdateRatingMutation, RecordRoute_UpdateRatingMutationVariables>;
export const RecordRoute_CreatePostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_createPost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePostInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"post"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RecordRoute_CreatePostMutation, RecordRoute_CreatePostMutationVariables>;
export const RecordRoute_DeletePostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_deletePost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeletePostInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RecordRoute_record"}}]}}]}}]}},...RecordRoute_RecordFragmentDoc.definitions,...UserLayout_UserFragmentDoc.definitions,...RecordRoute_HeaderFragmentDoc.definitions,...RecordRoute_Header_CategoryFragmentDoc.definitions,...PostComposer_RecordFragmentDoc.definitions]} as unknown as DocumentNode<RecordRoute_DeletePostMutation, RecordRoute_DeletePostMutationVariables>;
export const RecordRoute_DeleteRecordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordRoute_deleteRecord"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleted"}}]}}]}}]} as unknown as DocumentNode<RecordRoute_DeleteRecordMutation, RecordRoute_DeleteRecordMutationVariables>;