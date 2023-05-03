import { RecordOrder, StatusType } from "./__generated__/globalTypes"

export type NormalizedUserRouteQuery = {
  orderBy: RecordOrder;
  statusType: StatusType | null;
  categoryId: string | null;
}

const SORT_MAPPING: Record<string, RecordOrder> = {
  'date': RecordOrder.Date,
  'title': RecordOrder.Title,
  'rating': RecordOrder.Rating,
}
const INVERSE_SORT_MAPPING: Record<RecordOrder, string> = {
  [RecordOrder.Date]: 'date',
  [RecordOrder.Title]: 'title',
  [RecordOrder.Rating]: 'rating',
}

const STATUS_TYPE_MAPPING: Record<string, StatusType> = {
  'watching': StatusType.Watching,
  'finished': StatusType.Finished,
  'suspended': StatusType.Suspended,
  'interested': StatusType.Interested,
}
const INVERSE_STATUS_TYPE_MAPPING: Record<StatusType, string> = {
  [StatusType.Watching]: 'watching',
  [StatusType.Finished]: 'finished',
  [StatusType.Suspended]: 'suspended',
  [StatusType.Interested]: 'interested',
}

export function normalizeUserRouteQuery(query: Record<string, any>): NormalizedUserRouteQuery {
  const { type, category, sort } = query;
  return {
    orderBy: SORT_MAPPING[sort] ?? RecordOrder.Date,
    statusType: STATUS_TYPE_MAPPING[type] ?? null,
    categoryId: category != null && category !== '' ? category : null,
  }
}

export function serializeUserRouteQuery(query: NormalizedUserRouteQuery): Record<string, string> {
  const result: Record<string, string> = {
    sort: INVERSE_SORT_MAPPING[query.orderBy]
  }
  if (query.statusType != null) {
    result.type = INVERSE_STATUS_TYPE_MAPPING[query.statusType]
  }
  if (query.categoryId != null) {
    result.category = query.categoryId
  }
  return result
}
