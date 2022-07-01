import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Post_PostFragmentDoc } from '../../ui/__generated__/GqlPost.graphql';
import { PostComment_PostFragmentDoc } from '../../ui/__generated__/GqlPostComment.graphql';
import { GqlWorkViewsFragmentDoc, GqlWorkViews_EpisodeFragmentDoc, GqlWorkViews_PostConnectionFragmentDoc } from '../../ui/__generated__/GqlWorkViews.graphql';
import { GqlWorkStatusButton_WorkFragmentDoc, GqlWorkStatusButton_RecordFragmentDoc } from '../../ui/__generated__/GqlWorkStatusButton.graphql';
import { WeeklyChartFragmentDoc } from '../../ui/__generated__/GqlWeeklyChart.graphql';
export type PostRouteQueryVariables = Types.Exact<{
  postId: Types.Scalars['ID'];
}>;


export type PostRouteQuery = { __typename?: 'Query', post: { __typename?: 'Post', id: string, statusType: Types.StatusType | null, status: string | null, comment: string | null, updatedAt: any | null, containsSpoiler: boolean | null, work: { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null, recordCount: number | null, record: { __typename?: 'Record', id: string, statusType: Types.StatusType | null, status: string | null } | null, episodes: Array<{ __typename?: 'Episode', number: number, postCount: number | null }> | null, metadata: { __typename?: 'WorkMetadata', studioNames: Array<string> | null, source: Types.SourceType | null, websiteUrl: string | null, namuwikiUrl: string | null, annUrl: string | null, schedules: Array<{ __typename?: 'WorkSchedule', country: string, date: any | null, datePrecision: Types.DatePrecision | null }> | null } | null } | null, episode: { __typename?: 'Episode', number: number, postCount: number | null, userCount: number | null, suspendedUserCount: number | null } | null, user: { __typename?: 'User', name: string | null } | null, record: { __typename?: 'Record', title: string | null } | null } | null, weeklyWorksChart: Array<{ __typename?: 'WorksChartItem', rank: number, diff: number | null, sign: number | null, work: { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null } }> };

export type PostRoute_PostsQueryVariables = Types.Exact<{
  workId: Types.Scalars['ID'];
  beforeId: Types.InputMaybe<Types.Scalars['ID']>;
  episode: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type PostRoute_PostsQuery = { __typename?: 'Query', work: { __typename?: 'Work', posts: { __typename?: 'PostConnection', hasMore: boolean, nodes: Array<{ __typename?: 'Post', id: string, statusType: Types.StatusType | null, status: string | null, comment: string | null, updatedAt: any | null, containsSpoiler: boolean | null, user: { __typename?: 'User', name: string | null } | null, record: { __typename?: 'Record', title: string | null } | null }> } } | null };

export type PostRoute_RefetchQueryVariables = Types.Exact<{
  postId: Types.Scalars['ID'];
}>;


export type PostRoute_RefetchQuery = { __typename?: 'Query', post: { __typename?: 'Post', id: string, statusType: Types.StatusType | null, status: string | null, comment: string | null, updatedAt: any | null, containsSpoiler: boolean | null, work: { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null, recordCount: number | null, record: { __typename?: 'Record', id: string, statusType: Types.StatusType | null, status: string | null } | null, episodes: Array<{ __typename?: 'Episode', number: number, postCount: number | null }> | null, metadata: { __typename?: 'WorkMetadata', studioNames: Array<string> | null, source: Types.SourceType | null, websiteUrl: string | null, namuwikiUrl: string | null, annUrl: string | null, schedules: Array<{ __typename?: 'WorkSchedule', country: string, date: any | null, datePrecision: Types.DatePrecision | null }> | null } | null } | null, episode: { __typename?: 'Episode', number: number, postCount: number | null, userCount: number | null, suspendedUserCount: number | null } | null, user: { __typename?: 'User', name: string | null } | null, record: { __typename?: 'Record', title: string | null } | null } | null };


export const PostRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PostRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"postId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"post"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"postId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Post_post"}},{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlWorkViews"}}]}},{"kind":"Field","name":{"kind":"Name","value":"episode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlWorkViews_episode"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WeeklyChart"}}]}},...Post_PostFragmentDoc.definitions,...PostComment_PostFragmentDoc.definitions,...GqlWorkViewsFragmentDoc.definitions,...GqlWorkStatusButton_WorkFragmentDoc.definitions,...GqlWorkStatusButton_RecordFragmentDoc.definitions,...GqlWorkViews_EpisodeFragmentDoc.definitions,...WeeklyChartFragmentDoc.definitions]} as unknown as DocumentNode<PostRouteQuery, PostRouteQueryVariables>;
export const PostRoute_PostsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PostRoute_posts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beforeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"work"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"posts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"beforeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beforeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"episode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlWorkViews_postConnection"}}]}}]}}]}},...GqlWorkViews_PostConnectionFragmentDoc.definitions,...Post_PostFragmentDoc.definitions,...PostComment_PostFragmentDoc.definitions]} as unknown as DocumentNode<PostRoute_PostsQuery, PostRoute_PostsQueryVariables>;
export const PostRoute_RefetchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PostRoute_refetch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"postId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"post"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"postId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Post_post"}},{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlWorkViews"}}]}},{"kind":"Field","name":{"kind":"Name","value":"episode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlWorkViews_episode"}}]}}]}}]}},...Post_PostFragmentDoc.definitions,...PostComment_PostFragmentDoc.definitions,...GqlWorkViewsFragmentDoc.definitions,...GqlWorkStatusButton_WorkFragmentDoc.definitions,...GqlWorkStatusButton_RecordFragmentDoc.definitions,...GqlWorkViews_EpisodeFragmentDoc.definitions]} as unknown as DocumentNode<PostRoute_RefetchQuery, PostRoute_RefetchQueryVariables>;