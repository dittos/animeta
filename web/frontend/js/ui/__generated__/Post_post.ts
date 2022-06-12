/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusType } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: Post_post
// ====================================================

export interface Post_post_user {
  __typename: "User";
  name: string | null;
}

export interface Post_post_record {
  __typename: "Record";
  title: string | null;
}

export interface Post_post {
  __typename: "Post";
  id: string;
  user: Post_post_user | null;
  record: Post_post_record | null;
  statusType: StatusType | null;
  status: string | null;
  comment: string | null;
  updatedAt: any | null;
  containsSpoiler: boolean | null;
}
