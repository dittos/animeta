require('isomorphic-fetch');
var DataLoader = require('dataloader');
var schema = require('./schema');

function createLoaders(fetch) {
    var userLoader = new DataLoader(function(keys) {
        return Promise.all(keys.map(function(key) {
            return fetch('/api/v2/users/_/' + key)
                .then(function(d) {
                    d.__type = schema.userType;
                    usernameLoader.prime(d.name, d);
                    return d;
                });
        }));
    });
    var usernameLoader = new DataLoader(function(keys) {
        return Promise.all(keys.map(function(key) {
            return fetch('/api/v2/users/' + key)
                .then(function(d) {
                    d.__type = schema.userType;
                    userLoader.prime(d.id, d);
                    return d;
                });
        }));
    });
    var recordLoader = new DataLoader(function(keys) {
        return Promise.all(keys.map(function(key) {
            return fetch('/api/v2/records/' + key)
                .then(function(d) {
                    d.__type = schema.recordType;
                    return d;
                });
        }));
    });
    return {
        user: userLoader,
        username: usernameLoader,
        record: recordLoader
    };
}

var graphqlHttp = require('express-graphql');
var app = require('express')();
app.use('/graphql', graphqlHttp(function(request) {
    var requestFetch = function(path, options) {
        return fetch('http://localhost:8000' + path, Object.assign(options||{}, {
            headers: Object.assign({cookie: request.headers.cookie},
                (options||{}).headers||{}),
        })).then(function(r) {
            if (r.ok)
                return r.json();
            return null;
        });
    };
    return {
        schema: schema,
        rootValue: {
            fetch: requestFetch,
            loaders: createLoaders(requestFetch)
        },
        graphiql: true
    };
}));
app.listen(3100);
