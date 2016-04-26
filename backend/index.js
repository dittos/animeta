import 'isomorphic-fetch';
import express from 'express';
import graphqlHttp from 'express-graphql';
import schema from './schema';
import {createContext} from './backend';

const app = express();

app.use('/graphql', graphqlHttp(request => {
    return {
        schema,
        context: createContext({auth: {cookie: request.headers.cookie}}),
        graphiql: true
    };
}));

app.listen(3100, () => {
    console.log('Running');
});
