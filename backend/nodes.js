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
} from 'graphql-relay';
import {
    nodeDefinitions,
    globalIdField,
    fromGlobalId,
    toGlobalId,
} from './relayNode';

const {nodeInterface, nodeField: _nodeField} = nodeDefinitions(
    (globalId, {loaders}) => {
        const {type, id} = fromGlobalId(globalId);
        if (type === 'User') {
            return loaders.user.load(id);
        } else if (type === 'Record') {
            return loaders.record.load(id);
        } else if (type === 'Category') {
            return loaders.category.load(id);
        }
    },
    obj => obj.__type
);

export const nodeField = _nodeField;

export const userType = new GraphQLObjectType({
    name: 'User',
    interfaces: [nodeInterface],
    fields: () => ({
        id: globalIdField(),
        simple_id: {
            type: GraphQLString,
            resolve: obj => obj.id
        },
        name: {
            type: GraphQLString
        },
        records: {
            type: recordConnection.connectionType,
            args: connectionArgs,
            resolve: (user, args, {fetch}) => connectionFromPromisedArray(
                fetch('/api/v2/users/' + user.name + '/records'),
                args
            )
        },
        categories: {
            type: new GraphQLList(categoryType)
        },
        connected_services: {
            type: new GraphQLList(GraphQLString)
        }
    })
});

export const categoryType = new GraphQLObjectType({
    name: 'Category',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField(),
        simple_id: {
            type: GraphQLString,
            resolve: obj => obj.id
        },
        name: {
            type: GraphQLString
        }
    }
});

export const recordType = new GraphQLObjectType({
    name: 'Record',
    interfaces: [nodeInterface],
    fields: () => ({
        id: globalIdField(),
        simple_id: {
            type: GraphQLString,
            resolve: obj => obj.id
        },
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
        category_id: {
            type: GraphQLString,
            resolve: ({category_id}) => category_id && `Category:${category_id}`
        },
        user_id: {
            type: GraphQLString,
            resolve: ({user_id}) => `User:${user_id}`
        },
        posts: {
            type: postConnection.connectionType,
            args: connectionArgs,
            resolve: (record, args, {fetch}) => connectionFromPromisedArray(
                fetch('/api/v2/records/' + record.id + '/posts')
                    .then(d => d.posts),
                args
            )
        }
    })
});

export const postType = new GraphQLObjectType({
    name: 'Post',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField(),
        simple_id: {
            type: GraphQLString,
            resolve: obj => obj.id
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
