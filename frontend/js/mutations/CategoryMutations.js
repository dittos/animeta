import Relay from 'react-relay';

export class AddCategoryMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {addCategory}`;
    }
    getVariables() {
        return {categoryName: this.props.categoryName};
    }
    getFatQuery() {
        return Relay.QL`
            fragment on AddCategoryPayload {
                user {
                    categories
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.viewer.id
            }
        }];
    }
}
AddCategoryMutation.fragments = {
    viewer: () => Relay.QL`fragment on User { id }`
};

export class ChangeCategoryOrderMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {changeCategoryOrder}`;
    }
    getVariables() {
        return {categoryIds: this.props.categories.map(category => category.id)};
    }
    getFatQuery() {
        return Relay.QL`
            fragment on ChangeCategoryOrderPayload {
                user {
                    categories
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.viewer.id
            }
        }];
    }
}
ChangeCategoryOrderMutation.fragments = {
    viewer: () => Relay.QL`fragment on User { id }`,
    categories: () => Relay.QL`fragment on Category @relay(plural: true) { id }`
};

export class RenameCategoryMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {renameCategory}`;
    }
    getVariables() {
        return {
            categoryId: this.props.category.id,
            categoryName: this.props.categoryName
        };
    }
    getFatQuery() {
        return Relay.QL`
            fragment on RenameCategoryPayload {
                category
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                category: this.props.category.id
            }
        }];
    }
}
RenameCategoryMutation.fragments = {
    category: () => Relay.QL`fragment on Category { id }`
};

export class DeleteCategoryMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {deleteCategory}`;
    }
    getVariables() {
        return {categoryId: this.props.category.id};
    }
    getFatQuery() {
        return Relay.QL`
            fragment on DeleteCategoryPayload {
                user {
                    categories
                    records
                }
            }
        `;
    }
    getConfigs() {
        // FIXME: since User.categories is not a connection, not using NODE_DELETE
        // would have orphaned Category record left
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.viewer.id
            }
        }];
    }
}
DeleteCategoryMutation.fragments = {
    category: () => Relay.QL`fragment on Category { id }`,
    viewer: () => Relay.QL`fragment on User { id }`
};
