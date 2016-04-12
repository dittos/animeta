var graphql = require('graphql');
var relay = require('graphql-relay');
var relayNode = require('./relayNode');
var FormData = require('form-data');

var nodeDefinitions = relayNode.nodeDefinitions(
    function (globalId, info) {
        var loaders = info.rootValue.loaders;
        globalId = relayNode.fromGlobalId(globalId);
        if (globalId.type === 'User') {
            return loaders.user.load(globalId.id);
        } else if (globalId.type === 'Record') {
            return loaders.record.load(globalId.id);
        }
    },
    function (obj) {
        return obj.__type;
    }
);
var nodeInterface = nodeDefinitions.nodeInterface;

var userType = new graphql.GraphQLObjectType({
    name: 'User',
    interfaces: [nodeInterface],
    fields: function() { return{
        id: relayNode.globalIdField(),
        name: {
            type: graphql.GraphQLString
        },
        records: {
            type: recordConnection.connectionType,
            args: relay.connectionArgs,
            resolve: function(user, args, info) {
                return relay.connectionFromPromisedArray(
                    info.rootValue.fetch('/api/v2/users/' + user.name + '/records'),
                    args
                );
            }
        },
        categories: {
            type: new graphql.GraphQLList(categoryType)
        },
        connected_services: {
            type: new graphql.GraphQLList(graphql.GraphQLString)
        }
    } }
});

var categoryType = new graphql.GraphQLObjectType({
    name: 'Category',
    interfaces: [nodeInterface],
    fields: {
        id: relayNode.globalIdField(),
        name: {
            type: graphql.GraphQLString
        }
    }
});

var recordType = new graphql.GraphQLObjectType({
    name: 'Record',
    interfaces: [nodeInterface],
    fields: function() { return {
        id: relayNode.globalIdField(),
        title: {
            type: graphql.GraphQLString
        },
        status: {
            type: graphql.GraphQLString
        },
        status_type: {
            type: graphql.GraphQLString
        },
        updated_at: {
            type: graphql.GraphQLString
        },
        category_id: {
            type: graphql.GraphQLString,
            resolve: function(record) {
                return 'Category:' + record.category_id;
            }
        },
        posts: {
            type: postConnection.connectionType,
            args: relay.connectionArgs,
            resolve: function(record, args, info) {
                return relay.connectionFromPromisedArray(
                    info.rootValue.fetch('/api/v2/records/' + record.id + '/posts').then(function(d){return d.posts;}),
                    args
                );
            }
        }
    } }
});

var postType = new graphql.GraphQLObjectType({
    name: 'Post',
    interfaces: [nodeInterface],
    fields: {
        id: relayNode.globalIdField(),
        status: {
            type: graphql.GraphQLString
        },
        status_type: {
            type: graphql.GraphQLString
        },
        updated_at: {
            type: graphql.GraphQLString
        },
        comment: {
            type: graphql.GraphQLString
        },
        contains_spoiler: {
            type: graphql.GraphQLBoolean
        }
    }
});

var recordConnection = relay.connectionDefinitions({nodeType: recordType});
var postConnection = relay.connectionDefinitions({nodeType: postType});

var addCategoryMutation = relay.mutationWithClientMutationId({
    name: 'AddCategory',
    inputFields: {
        categoryName: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
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
    mutateAndGetPayload: function(input, info) {
        var form = new FormData();
        form.append('name', input.categoryName);
        return info.rootValue.fetch('/api/v2/users/_/categories', {
            method: 'POST',
            body: form
        }).then(function(category) {
            return info.rootValue.fetch('/api/v2/me')
                .then(function(d){
                    return {
                        category: category,
                        user: d
                    };
                });
        });
    }
});

var changeCategoryOrderMutation = relay.mutationWithClientMutationId({
    name: 'ChangeCategoryOrder',
    inputFields: {
        categoryIds: {
            type: new graphql.GraphQLList(graphql.GraphQLID)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    mutateAndGetPayload: function(input, info) {
        var body = input.categoryIds.map(function(categoryId) {
            return 'ids[]=' + relayNode.fromGlobalId(categoryId).id;
        });
        return info.rootValue.fetch('/api/v2/users/_/categories', {
            method: 'PUT',
            body: body.join('&')
        }).then(function() {
            return info.rootValue.fetch('/api/v2/me')
                .then(function(user){
                    return {
                        user: user
                    };
                });
        });
    }
});

var renameCategoryMutation = relay.mutationWithClientMutationId({
    name: 'RenameCategory',
    inputFields: {
        categoryId: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        },
        categoryName: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
    },
    outputFields: {
        category: {
            type: categoryType
        }
    },
    mutateAndGetPayload: function(input, info) {
        var backendId = relayNode.fromGlobalId(input.categoryId).id;
        var form = new FormData();
        form.append('name', input.categoryName);
        return info.rootValue.fetch('/api/v2/categories/' + backendId, {
            method: 'POST',
            body: form
        }).then(function(category) {
            return {category: category};
        });
    }
});

var deleteCategoryMutation = relay.mutationWithClientMutationId({
    name: 'DeleteCategory',
    inputFields: {
        categoryId: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    mutateAndGetPayload: function(input, info) {
        var backendId = relayNode.fromGlobalId(input.categoryId).id;
        return info.rootValue.fetch('/api/v2/categories/' + backendId, {
            method: 'DELETE'
        }).then(function() {
            return info.rootValue.fetch('/api/v2/me')
                .then(function(user){
                    return {
                        user: user
                    };
                });
        });
    }
});

module.exports = exports = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'Query',
        fields: {
            node: nodeDefinitions.nodeField,

            user: {
                type: userType,
                args: {
                    name: {
                        type: graphql.GraphQLString
                    }
                },
                resolve: function(source, args, info) {
                    return source.loaders.username.load(args.name);
                }
            },

            viewer: {
                type: userType,
                resolve: function(source, args, info) {
                    return info.rootValue.fetch('/api/v2/me')
                        .then(function(d){
                            if (d) {
                                d.__type = userType;
                                source.loaders.user.prime(d.id, d);
                                source.loaders.username.prime(d.name, d);
                            }
                            return d
                        })
                }
            }
        }
    }),
    mutation: new graphql.GraphQLObjectType({
        name: 'Mutation',
        fields: {
            addCategory: addCategoryMutation,
            changeCategoryOrder: changeCategoryOrderMutation,
            renameCategory: renameCategoryMutation,
            deleteCategory: deleteCategoryMutation,
        }
    })
});

exports.userType = userType;
exports.recordType = recordType;
