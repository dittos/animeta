/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusType } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: IndexRouteQuery
// ====================================================

export interface IndexRouteQuery_timeline_user {
  __typename: "User";
  name: string | null;
}

export interface IndexRouteQuery_timeline_record {
  __typename: "Record";
  title: string | null;
}

export interface IndexRouteQuery_timeline {
  __typename: "Post";
  id: string;
  user: IndexRouteQuery_timeline_user | null;
  record: IndexRouteQuery_timeline_record | null;
  statusType: StatusType | null;
  status: string | null;
  comment: string | null;
  updatedAt: any | null;
  containsSpoiler: boolean | null;
}

export interface IndexRouteQuery {
  timeline: (IndexRouteQuery_timeline | null)[] | null;
}

export interface IndexRouteQueryVariables {
  timelineBeforeId?: string | null;
  count?: number | null;
}
