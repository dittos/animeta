import 'isomorphic-fetch';
import express from 'express';
import graphqlHttp from 'express-graphql';
import schema from './schema';
import {createLoaders} from './loaders';

const app = express();

app.use('/graphql', graphqlHttp(request => {
    var requestFetch = async function(path, options = {}) {
        const resp = await fetch('http://localhost:8000' + path, Object.assign(options, {
            headers: Object.assign({cookie: request.headers.cookie}, options.headers)
        }));
        if (resp.ok)
            return resp.json();
        return null;
    };
    return {
        schema,
        context: {
            fetch: requestFetch,
            loaders: createLoaders(requestFetch)
        },
        graphiql: true
    };
}));

app.listen(3100, () => {
    console.log('Running');
});
