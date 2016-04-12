import DataLoader from 'dataloader';
import {userType, recordType} from './schema';

function Loader(fetch) {
    this.user = new DataLoader(keys => Promise.all(
        keys.map(key => fetch('/api/v2/users/_/' + key)
            .then(d => {
                d.__type = userType;
                this.username.prime(d.name, d);
                return d;
            }))
    ));
    this.username = new DataLoader(keys => Promise.all(
        keys.map(key => fetch('/api/v2/users/' + key)
            .then(d => {
                d.__type = userType;
                this.user.prime(d.id, d);
                return d;
            }))
    ));
    this.record = new DataLoader(keys => Promise.all(
        keys.map(key => fetch('/api/v2/records/' + key)
            .then(d => {
                d.__type = recordType;
                return d;
            }))
    ));
}

export function createLoaders(fetch) {
    return new Loader(fetch);
}
