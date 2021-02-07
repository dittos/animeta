import { Subject } from 'rxjs';
import { RecordDTO } from './../../shared/types_generated';

export const records = new Subject<RecordDTO>();
