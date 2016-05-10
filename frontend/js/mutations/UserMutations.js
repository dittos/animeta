import Relay from 'react-relay';

export class RefreshViewerConnectedServicesMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {refreshViewerConnectedServices}`;
    }
    getVariables() {
        return {};
    }
    getFatQuery() {
        return Relay.QL`
            fragment on RefreshViewerConnectedServicesPayload {
                viewer {
                    connected_services
                }
            }
        `;
    }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                viewer: this.props.viewer.id
            }
        }];
    }
}
RefreshViewerConnectedServicesMutation.fragments = {
    viewer: () => Relay.QL`fragment on User { id }`
};
