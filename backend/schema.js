import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
    GraphQLID,
} from 'graphql';
import {
    nodeField,
    userType,
} from './nodes';
import mutationType from './mutations';
import {lazyRootResolver} from './backend';

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,

        user: {
            type: userType,
            args: {
                name: {
                    type: GraphQLString
                }
            },
            resolve: lazyRootResolver,
        },

        viewer: {
            type: userType,
            resolve: lazyRootResolver,
        }
    }
});

export default new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});
