/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusType } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: CuratedListQuery
// ====================================================

export interface CuratedListQuery_curatedList_works_edges_node_record {
  __typename: "Record";
  id: string | null;
  statusType: StatusType | null;
}

export interface CuratedListQuery_curatedList_works_edges_node {
  __typename: "Work";
  id: string | null;
  record: CuratedListQuery_curatedList_works_edges_node_record | null;
  title: string | null;
  imageUrl: string | null;
  recordCount: number | null;
}

export interface CuratedListQuery_curatedList_works_edges {
  __typename: "CuratedListWorkEdge";
  node: CuratedListQuery_curatedList_works_edges_node | null;
}

export interface CuratedListQuery_curatedList_works {
  __typename: "CuratedListWorkConnection";
  edges: (CuratedListQuery_curatedList_works_edges | null)[] | null;
}

export interface CuratedListQuery_curatedList {
  __typename: "CuratedList";
  works: CuratedListQuery_curatedList_works | null;
}

export interface CuratedListQuery {
  curatedList: CuratedListQuery_curatedList | null;
}

export interface CuratedListQueryVariables {
  id?: string | null;
}
