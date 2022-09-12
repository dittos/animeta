import * as Types from '../../__generated__/globalTypes';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type WeeklyChartFragment = { __typename?: 'Query', weeklyWorksChart: Array<{ __typename?: 'WorksChartItem', rank: number, diff: number | null, sign: number | null, work: { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null } }> };

export const WeeklyChartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WeeklyChart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weeklyWorksChart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"diff"}},{"kind":"Field","name":{"kind":"Name","value":"sign"}}]}}]}}]} as unknown as DocumentNode<WeeklyChartFragment, unknown>;