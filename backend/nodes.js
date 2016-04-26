import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
    GraphQLID,
} from 'graphql';
import {
    connectionArgs,
    connectionDefinitions,
    connectionFromPromisedArray,
    mutationWithClientMutationId,
    nodeDefinitions,
} from 'graphql-relay';
import {fetchNode, lazyFieldResolver} from './backend';

const {nodeInterface, nodeField: _nodeField} = nodeDefinitions(
    (globalId, context, info) => fetchNode(context, globalId)
);

export const nodeField = _nodeField;

export const userType = new GraphQLObjectType({
    name: 'User',
    interfaces: [nodeInterface],
    isTypeOf: value => value.__typename === 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        simple_id: {type: GraphQLID},
        name: {
            type: GraphQLString
        },
        records: {
            type: recordConnection.connectionType,
            args: connectionArgs,
            resolve: lazyFieldResolver,
        },
        categories: {
            type: new GraphQLList(categoryType),
            resolve: lazyFieldResolver,
        },
        connected_services: {
            type: new GraphQLList(GraphQLString),
            resolve: lazyFieldResolver,
        }
    })
});

export const categoryType = new GraphQLObjectType({
    name: 'Category',
    interfaces: [nodeInterface],
    isTypeOf: value => value.__typename === 'Category',
    fields: {
        id: {type: new GraphQLNonNull(GraphQLID)},
        simple_id: {type: GraphQLID},
        name: {
            type: GraphQLString
        },
        user_id: {
            type: GraphQLID
        }
    }
});

export const recordType = new GraphQLObjectType({
    name: 'Record',
    interfaces: [nodeInterface],
    isTypeOf: value => value.__typename === 'Record',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        simple_id: {type: GraphQLID},
        title: {
            type: GraphQLString
        },
        status: {
            type: GraphQLString
        },
        status_type: {
            type: GraphQLString
        },
        updated_at: {
            type: GraphQLString
        },
        category_id: {type: GraphQLID},
        user_id: {type: GraphQLID},
        posts: {
            type: postConnection.connectionType,
            args: connectionArgs,
            resolve: lazyFieldResolver
        }
    })
});

export const postType = new GraphQLObjectType({
    name: 'Post',
    interfaces: [nodeInterface],
    isTypeOf: value => value.__typename === 'Post',
    fields: {
        id: {type: new GraphQLNonNull(GraphQLID)},
        simple_id: {type: GraphQLID},
        user_id: {type: GraphQLID},
        status: {
            type: GraphQLString
        },
        status_type: {
            type: GraphQLString
        },
        updated_at: {
            type: GraphQLString
        },
        comment: {
            type: GraphQLString
        },
        contains_spoiler: {
            type: GraphQLBoolean
        }
    }
});

export const recordConnection = connectionDefinitions({nodeType: recordType});
export const postConnection = connectionDefinitions({nodeType: postType});
