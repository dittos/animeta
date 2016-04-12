var graphql = require('graphql');
var utils = require('graphql/utilities');
var schema = require('./schema');

graphql.graphql(schema, utils.introspectionQuery).then(function(result) {
    if (result.errors) {
        console.error('ERROR: ', JSON.stringify(result.errors, null, 2));
    } else {
        console.log(JSON.stringify(result, null, 2));
    }
});
