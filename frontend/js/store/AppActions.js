export function loadCurrentUser(user) {
    return {
        type: 'loadCurrentUser',
        user: user
    };
}

export function loadCurrentUserFromClient() {
    return (dispatch, client) => {
        return client.getCurrentUser().then(user => {
            dispatch({
                type: 'loadedCurrentUser',
                user
            });
        });
    };
}

export function loadSidebarChart() {
    return (dispatch, client, getState) => {
        // TODO: refresh after expiry
        // load only once
        if (getState().app.sidebarChart)
            return Promise.resolve();
        return client.call('/charts/works/weekly', {limit: 5}).then(data => {
            dispatch({
                type: 'loadedSidebarChart',
                data
            });
        });
    };
}
