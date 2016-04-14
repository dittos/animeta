import DataLoader from 'dataloader';
import {userType, recordType, categoryType} from './schema';

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
    this.viewer = new DataLoader(keys => Promise.all(
        keys.map(key => fetch('/api/v2/me')
            .then(d => {
                d.__type = userType;
                this.user.prime(d.id, d);
                this.username.prime(d.name, d);
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
    this.category = new DataLoader(keys => Promise.all(
        keys.map(key => fetch('/api/v2/categories/' + key)
            .then(d => {
                d.__type = categoryType;
                return d;
            }))
    ));
}

export function createLoaders(fetch) {
    return new Loader(fetch);
}
