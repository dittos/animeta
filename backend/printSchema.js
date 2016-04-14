import fs from 'fs';
import {graphql} from 'graphql';
import {introspectionQuery} from 'graphql/utilities';
import schema from './schema';

graphql(schema, introspectionQuery).then(result => {
    if (result.errors) {
        console.error('ERROR: ', JSON.stringify(result.errors, null, 2));
    } else {
        fs.writeFileSync('../schema.json', JSON.stringify(result, null, 2));
    }
});
