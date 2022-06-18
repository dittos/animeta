import { RecordResolvers } from "src/graphql/generated";
import { StatusType } from "src/entities/status_type";

export const Record: RecordResolvers = {
  statusType: (record) => StatusType[record.status_type] as keyof typeof StatusType,
}