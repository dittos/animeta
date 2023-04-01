import { Subject } from 'rxjs';

export type RecordMutationEvent = {
  id: string
  userId: string
  workId: string
}

export const records = new Subject<RecordMutationEvent>();
