import Relay from 'react-relay';

export class AddRecordMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {addRecord}`;
    }
    getVariables() {
        return {
            username: this.props.user.name,
            title: this.props.title,
            statusType: this.props.statusType,
            categoryId: this.props.category && this.props.category.id
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on AddRecordPayload {
                user {records}
                newRecordEdge
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'user',
            parentID: this.props.user.id,
            connectionName: 'records',
            edgeName: 'newRecordEdge',
            rangeBehaviors: {
                '': 'prepend'
            }
        }];
    }
}
AddRecordMutation.fragments = {
    user: () => Relay.QL`fragment on User { id, name }`,
    category: () => Relay.QL`fragment on Category { id }`
};

export class ChangeRecordCategoryMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {changeRecordCategory}`;
    }
    getVariables() {
        return {
            recordId: this.props.record.id,
            categoryId: this.props.category && this.props.category.id
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on ChangeRecordCategoryPayload {
                record {
                    category_id
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                record: this.props.record.id
            }
        }];
    }
}
ChangeRecordCategoryMutation.fragments = {
    record: () => Relay.QL`fragment on Record { id }`,
    category: () => Relay.QL`fragment on Category { id }`
};

export class ChangeRecordTitleMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {changeRecordTitle}`;
    }
    getVariables() {
        return {
            recordId: this.props.record.id,
            title: this.props.title,
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on ChangeRecordTitlePayload {
                record {
                    title
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                record: this.props.record.id
            }
        }];
    }
}
ChangeRecordTitleMutation.fragments = {
    record: () => Relay.QL`fragment on Record { id }`
};

export class DeleteRecordMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {deleteRecord}`;
    }
    getVariables() {
        return {
            recordId: this.props.record.id
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on DeleteRecordPayload {
                deletedRecordId
                user { records }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'NODE_DELETE',
            parentName: 'user',
            parentID: this.props.record.user_id,
            connectionName: 'records',
            deletedIDFieldName: 'deletedRecordId'
        }];
    }
}
DeleteRecordMutation.fragments = {
    record: () => Relay.QL`fragment on Record { id }`
};
