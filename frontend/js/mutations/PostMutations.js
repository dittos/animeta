import Relay from 'react-relay';

export class DeletePostMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {deletePost}`;
    }
    getVariables() {
        return {
            postId: this.props.post.id
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on DeletePostPayload {
                deletedPostId
                record {
                    status
                    status_type
                    updated_at
                    posts
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'NODE_DELETE',
            parentName: 'record',
            parentID: this.props.record.id,
            connectionName: 'posts',
            deletedIDFieldName: 'deletedPostId'
        }, {
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                record: this.props.record.id
            }
        }];
    }
}
DeletePostMutation.fragments = {
    post: () => Relay.QL`fragment on Post { id }`,
    record: () => Relay.QL`fragment on Record { id }`
};

export class CreatePostMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {createPost}`;
    }
    getVariables() {
        return {
            recordId: this.props.record.id,
            data: this.props.data,
            //publishOptions: this.props.publishOptions,
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on CreatePostPayload @relay(pattern: true) {
                createdPostEdge
                record {
                    status
                    status_type
                    updated_at
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'record',
            parentID: this.props.record.id,
            connectionName: 'posts',
            edgeName: 'createdPostEdge',
            rangeBehaviors: {
                '': 'prepend'
            }
        }, {
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                record: this.props.record.id
            }
        }];
    }
}
CreatePostMutation.fragments = {
    record: () => Relay.QL`fragment on Record { id }`
};
