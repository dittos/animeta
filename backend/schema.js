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
            resolve: (root, args, {loaders}) => loaders.username.load(args.name)
        },

        viewer: {
            type: userType,
            resolve: (root, args, {loaders}) => loaders.viewer.load(1)
        }
    }
});

export default new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});
