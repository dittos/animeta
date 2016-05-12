import FormData from 'form-data';
import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
    GraphQLID,
} from 'graphql';
import {
    userType,
    categoryType,
    recordType,
    postConnection,
    recordConnection,
} from './nodes';
import {mutationWithClientMutationId} from 'graphql-relay';
import {fetchNode} from './backend';

function fromGlobalId(globalId) {
    const [typename, id] = globalId.split(':');
    return {typename, id};
}

const refreshViewerConnectedServices = mutationWithClientMutationId({
    name: 'RefreshViewerConnectedServices',
    inputFields: {},
    outputFields: {
        viewer: {
            type: userType,
        }
    },
    async mutateAndGetPayload(input, context) {
        const viewer = await context.call({
            type: 'root',
            field: 'viewer'
        });
        return {viewer};
    }
});

const addCategory = mutationWithClientMutationId({
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
    async mutateAndGetPayload({categoryName}, {fetch, call}) {
        const form = new FormData();
        form.append('name', categoryName);
        const category = await fetch('/api/v2/users/_/categories', {
            method: 'POST',
            body: form
        });
        const user = await call({type: 'root', field: 'viewer'});
        return {category, user};
    }
});

const changeCategoryOrder = mutationWithClientMutationId({
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
    async mutateAndGetPayload({categoryIds}, {fetch, call}) {
        const body = categoryIds.map(fromGlobalId).map(({id}) => 'ids[]=' + id);
        await fetch('/api/v2/users/_/categories', {
            method: 'PUT',
            body: body.join('&')
        });
        const user = await call({type: 'root', field: 'viewer'});
        return {user};
    }
});

const renameCategory = mutationWithClientMutationId({
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
    async mutateAndGetPayload({categoryId, categoryName}, {fetch}) {
        const {id} = fromGlobalId(categoryId);
        const form = new FormData();
        form.append('name', categoryName);
        const category = await fetch('/api/v2/categories/' + id, {
            method: 'POST',
            body: form
        });
        return {category};
    }
});

const deleteCategory = mutationWithClientMutationId({
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
    async mutateAndGetPayload({categoryId}, {fetch, call}) {
        const {id} = fromGlobalId(categoryId);
        await fetch('/api/v2/categories/' + id, {
            method: 'DELETE'
        });
        const user = await call({type: 'root', field: 'viewer'});
        return {user};
    }
});

const addRecord = mutationWithClientMutationId({
    name: 'AddRecord',
    inputFields: {
        username: {
            type: new GraphQLNonNull(GraphQLString)
        },
        title: {
            type: new GraphQLNonNull(GraphQLString)
        },
        statusType: {
            type: GraphQLString // TODO: enum
        },
        categoryId: {
            type: GraphQLID
        }
    },
    outputFields: {
        user: {
            type: userType
        },
        newRecordEdge: {
            type: recordConnection.edgeType
        }
    },
    async mutateAndGetPayload(input, context) {
        let simpleCategoryId = '';
        if (input.categoryId) {
            simpleCategoryId = fromGlobalId(input.categoryId).id;
        }
        const form = new FormData();
        form.append('work_title', input.title);
        form.append('status_type', input.statusType);
        form.append('category_id', simpleCategoryId);
        let {record} = await context.fetch('/api/v2/users/' + input.username + '/records', {
            method: 'POST',
            body: form
        });
        record = await fetchNode(context, 'Record:' + record.id);
        const user = await fetchNode(context, record.user_id);
        return {
            user,
            newRecordEdge: {
                node: record,
                cursor: String(record.simple_id), // TODO: move to backend
            }
        };
    }
});

const changeRecordCategory = mutationWithClientMutationId({
    name: 'ChangeRecordCategory',
    inputFields: {
        recordId: {
            type: new GraphQLNonNull(GraphQLID)
        },
        categoryId: {
            type: GraphQLID
        }
    },
    outputFields: {
        record: {
            type: recordType
        }
    },
    async mutateAndGetPayload({recordId, categoryId}, {fetch}) {
        const {id: simpleRecordId} = fromGlobalId(recordId);
        let simpleCategoryId = '';
        if (categoryId) {
            simpleCategoryId = fromGlobalId(categoryId).id;
        }
        const form = new FormData();
        form.append('category_id', simpleCategoryId);
        const record = await fetch('/api/v2/records/' + simpleRecordId, {
            method: 'POST',
            body: form
        });
        return {record};
    }
});

const changeRecordTitle = mutationWithClientMutationId({
    name: 'ChangeRecordTitle',
    inputFields: {
        recordId: {
            type: new GraphQLNonNull(GraphQLID)
        },
        title: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        record: {
            type: recordType
        }
    },
    async mutateAndGetPayload({recordId, title}, {fetch}) {
        const {id: simpleRecordId} = fromGlobalId(recordId);
        const form = new FormData();
        form.append('title', title);
        const record = await fetch('/api/v2/records/' + simpleRecordId, {
            method: 'POST',
            body: form
        });
        // TODO: error handling
        return {record};
    }
});

const deleteRecord = mutationWithClientMutationId({
    name: 'DeleteRecord',
    inputFields: {
        recordId: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    outputFields: {
        deletedRecordId: {
            type: GraphQLID
        },
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({recordId}, context) {
        const {id} = fromGlobalId(recordId);
        await context.fetch('/api/v2/records/' + id, {
            method: 'DELETE'
        });
        const user = await context.call({
            type: 'root',
            field: 'viewer'
        });
        return {
            deletedRecordId: recordId,
            user
        };
    }
});

const deletePost = mutationWithClientMutationId({
    name: 'DeletePost',
    inputFields: {
        postId: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    outputFields: {
        deletedPostId: {
            type: GraphQLID
        },
        record: {
            type: recordType
        }
    },
    async mutateAndGetPayload({postId}, context) {
        const {id} = fromGlobalId(postId);
        let {record} = await context.fetch('/api/v2/posts/' + id, {
            method: 'DELETE'
        });
        record = await fetchNode(context, 'Record:' + record.id);
        return {
            deletedPostId: postId,
            record
        };
    }
});

const createPost = mutationWithClientMutationId({
    name: 'CreatePost',
    inputFields: {
        recordId: {
            type: new GraphQLNonNull(GraphQLID)
        },
        data: {
            type: new GraphQLInputObjectType({
                name: 'CreatePostInputData',
                fields: {
                    status: {type: GraphQLString},
                    status_type: {type: new GraphQLNonNull(GraphQLString)},
                    comment: {type: GraphQLString},
                    contains_spoiler: {type: GraphQLBoolean},
                }
            })
        },
        publishOptions: {
            type: new GraphQLList(GraphQLString), // TODO: enum
        }
    },
    outputFields: {
        createdPostEdge: {
            type: postConnection.edgeType
        },
        record: {
            type: recordType
        }
    },
    async mutateAndGetPayload({recordId, data}, context) {
        const {fetch} = context;
        const {id} = fromGlobalId(recordId);
        const form = new FormData();
        form.append('status', data.status);
        form.append('status_type', data.status_type);
        form.append('comment', data.comment);
        if (data.contains_spoiler) {
            form.append('contains_spoiler', 'true');
        }
        // TODO: publish_twitter
        let {post, record} = await fetch('/api/v2/records/' + id + '/posts', {
            method: 'POST',
            body: form
        });
        post = await fetchNode(context, 'Post:' + post.id);
        record = await fetchNode(context, 'Record:' + record.id);
        return {
            createdPostEdge: {
                node: post,
                cursor: String(post.simple_id), // TODO: move to backend
            },
            record
        };
    }
});

export default new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        refreshViewerConnectedServices,

        addCategory,
        changeCategoryOrder,
        renameCategory,
        deleteCategory,

        addRecord,
        changeRecordCategory,
        changeRecordTitle,
        deleteRecord,

        createPost,
        deletePost,
    }
});
