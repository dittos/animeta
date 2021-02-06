import { Subject } from 'rxjs';
import { RecordDTO } from './types_generated';

export const records = new Subject<RecordDTO>();
