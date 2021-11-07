/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CuratedListsQuery
// ====================================================

export interface CuratedListsQuery_curatedLists {
  __typename: "CuratedList";
  id: string | null;
  name: string | null;
}

export interface CuratedListsQuery {
  curatedLists: (CuratedListsQuery_curatedLists | null)[] | null;
}
