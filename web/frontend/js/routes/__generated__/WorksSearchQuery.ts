/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusType } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WorksSearchQuery
// ====================================================

export interface WorksSearchQuery_searchWorks_edges_node_record {
  __typename: "Record";
  id: string | null;
  statusType: StatusType | null;
}

export interface WorksSearchQuery_searchWorks_edges_node {
  __typename: "Work";
  id: string | null;
  record: WorksSearchQuery_searchWorks_edges_node_record | null;
  title: string | null;
  imageUrl: string | null;
}

export interface WorksSearchQuery_searchWorks_edges {
  __typename: "SearchWorksResultEdge";
  recordCount: number | null;
  node: WorksSearchQuery_searchWorks_edges_node;
}

export interface WorksSearchQuery_searchWorks {
  __typename: "SearchWorksResult";
  edges: WorksSearchQuery_searchWorks_edges[];
}

export interface WorksSearchQuery {
  searchWorks: WorksSearchQuery_searchWorks | null;
}

export interface WorksSearchQueryVariables {
  query: string;
}
