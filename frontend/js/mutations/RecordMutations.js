import Relay from 'react-relay';

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
