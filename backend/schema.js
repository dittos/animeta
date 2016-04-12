import FormData from 'form-data';
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

const {nodeInterface, nodeField} = nodeDefinitions(
    (globalId, info) => {
        const loaders = info.rootValue.loaders;
        const {type, id} = fromGlobalId(globalId);
        if (type === 'User') {
            return loaders.user.load(id);
        } else if (type === 'Record') {
            return loaders.record.load(id);
        }
    },
    obj => obj.__type
);

export const userType = new GraphQLObjectType({
    name: 'User',
    interfaces: [nodeInterface],
    fields: () => ({
        id: globalIdField(),
        name: {
            type: GraphQLString
        },
        records: {
            type: recordConnection.connectionType,
            args: connectionArgs,
            resolve: (user, args, info) => connectionFromPromisedArray(
                info.rootValue.fetch('/api/v2/users/' + user.name + '/records'),
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

const categoryType = new GraphQLObjectType({
    name: 'Category',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField(),
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
            resolve: (record) => 'Category:' + record.category_id
        },
        posts: {
            type: postConnection.connectionType,
            args: connectionArgs,
            resolve: (record, args, info) => connectionFromPromisedArray(
                info.rootValue.fetch('/api/v2/records/' + record.id + '/posts')
                    .then(d => d.posts),
                args
            )
        }
    })
});

const postType = new GraphQLObjectType({
    name: 'Post',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField(),
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

const recordConnection = connectionDefinitions({nodeType: recordType});
const postConnection = connectionDefinitions({nodeType: postType});

const addCategoryMutation = mutationWithClientMutationId({
    name: 'AddCategory',
    inputFields: {
        categoryName: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        category: {
            type: categoryType
        },
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({categoryName}, info) {
        const form = new FormData();
        form.append('name', categoryName);
        const category = await info.rootValue.fetch('/api/v2/users/_/categories', {
            method: 'POST',
            body: form
        });
        const user = await info.rootValue.fetch('/api/v2/me');
        return {category, user};
    }
});

const changeCategoryOrderMutation = mutationWithClientMutationId({
    name: 'ChangeCategoryOrder',
    inputFields: {
        categoryIds: {
            type: new GraphQLList(GraphQLID)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({categoryIds}, info) {
        const body = categoryIds.map(fromGlobalId).map(({id}) => 'ids[]=' + id);
        await info.rootValue.fetch('/api/v2/users/_/categories', {
            method: 'PUT',
            body: body.join('&')
        });
        const user = await info.rootValue.fetch('/api/v2/me');
        return {user};
    }
});

const renameCategoryMutation = mutationWithClientMutationId({
    name: 'RenameCategory',
    inputFields: {
        categoryId: {
            type: new GraphQLNonNull(GraphQLID)
        },
        categoryName: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        category: {
            type: categoryType
        }
    },
    async mutateAndGetPayload({categoryId, categoryName}, info) {
        const {id} = fromGlobalId(categoryId);
        const form = new FormData();
        form.append('name', categoryName);
        const category = await info.rootValue.fetch('/api/v2/categories/' + id, {
            method: 'POST',
            body: form
        });
        return {category};
    }
});

const deleteCategoryMutation = mutationWithClientMutationId({
    name: 'DeleteCategory',
    inputFields: {
        categoryId: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({categoryId}, info) {
        const {id} = fromGlobalId(categoryId);
        await info.rootValue.fetch('/api/v2/categories/' + id, {
            method: 'DELETE'
        });
        const user = await info.rootValue.fetch('/api/v2/me');
        return {user};
    }
});

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
            resolve: ({loaders}, args) => loaders.username.load(args.name)
        },

        viewer: {
            type: userType,
            resolve: ({loaders, fetch}, args) => fetch('/api/v2/me')
                .then(d => {
                    if (d) {
                        d.__type = userType;
                        loaders.user.prime(d.id, d);
                        loaders.username.prime(d.name, d);
                    }
                    return d
                })
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addCategory: addCategoryMutation,
        changeCategoryOrder: changeCategoryOrderMutation,
        renameCategory: renameCategoryMutation,
        deleteCategory: deleteCategoryMutation,
    }
});

export default new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});
