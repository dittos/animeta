export function fetch(cacheKey, path, params) {
    return (dispatch, client) => {
        dispatch({
            type: 'fetch',
            cacheKey
        });
        // TODO: failure
        return client.call(path, params).then(data => {
            dispatch({
                type: 'fetchSuccess',
                cacheKey,
                data
            });
            return data;
        });
    };
}
