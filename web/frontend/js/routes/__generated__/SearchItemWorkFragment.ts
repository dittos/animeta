/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusType } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: SearchItemWorkFragment
// ====================================================

export interface SearchItemWorkFragment_record {
  __typename: "Record";
  id: string | null;
  statusType: StatusType | null;
}

export interface SearchItemWorkFragment {
  __typename: "Work";
  id: string | null;
  record: SearchItemWorkFragment_record | null;
}
