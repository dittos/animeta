import { Subject } from 'rxjs/Subject';

export interface Record {
    // TODO
    user_id: number;
    work_id: number;
}

export const records = new Subject();
